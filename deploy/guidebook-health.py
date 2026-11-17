#!/usr/bin/env python3
"""Small, dependency-free GuideBook VPS health sampler."""

from __future__ import annotations

import datetime as dt
import json
import os
import re
import shutil
import sqlite3
import statistics
import subprocess
import sys
import time
from pathlib import Path

STATE_DIR = Path('/var/lib/guidebook-health')
LOG_DIR = Path('/var/log/guidebook-health')
STATE_FILE = STATE_DIR / 'state.json'
ALERT_FILE = LOG_DIR / 'alerts.jsonl'
SIZE_FILE = LOG_DIR / 'directory-sizes.jsonl'
MONGO_DIR = Path('/var/lib/mongodb')
NGINX_ACCESS = Path('/var/log/nginx/access.log')
STATS_DB = Path('/var/lib/guidebook-stats/stats.sqlite')
TAIL_BYTES = 16 * 1024 * 1024
MIB = 1024 * 1024
GIB = 1024 * MIB
ACCESS_RE = re.compile(r'\[([^]]+)\]\s+"([A-Z]+)\s([^\"]*)"\s+(\d{3})\s')
CURRENT_STATE: dict | None = None


def run(args: list[str], timeout: int = 60) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, text=True, capture_output=True, timeout=timeout, check=False)


def load_state() -> dict:
    try:
        return json.loads(STATE_FILE.read_text())
    except (OSError, json.JSONDecodeError):
        return {}


def save_state(state: dict) -> None:
    tmp = STATE_FILE.with_suffix('.tmp')
    tmp.write_text(json.dumps(state, separators=(',', ':')) + '\n')
    os.chmod(tmp, 0o600)
    tmp.replace(STATE_FILE)


def emit_alert(key: str, active: bool, details: dict) -> None:
    state = CURRENT_STATE if CURRENT_STATE is not None else load_state()
    active_alerts = set(state.get('activeAlerts', []))
    if active == (key in active_alerts):
        return
    if active:
        active_alerts.add(key)
    else:
        active_alerts.discard(key)
    state['activeAlerts'] = sorted(active_alerts)
    save_state(state)
    event = {
        'timestamp': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'),
        'level': 'warning' if active else 'info',
        'event': 'health_alert' if active else 'health_alert_resolved',
        'check': key,
        **details,
    }
    line = json.dumps(event, separators=(',', ':'))
    with ALERT_FILE.open('a') as stream:
        stream.write(line + '\n')
    logger = shutil.which('logger')
    if logger:
        run([logger, '-p', 'user.warning' if active else 'user.notice', '-t', 'guidebook-health', '--', line], 5)
    recipient = os.environ.get('GUIDEBOOK_ALERT_EMAIL')
    mail = shutil.which('mail')
    if active and recipient and mail:
        run([mail, '-s', f'GuideBook server alert: {key}', recipient], 10)


def read_meminfo() -> dict[str, int]:
    values: dict[str, int] = {}
    for line in Path('/proc/meminfo').read_text().splitlines():
        key, _, rest = line.partition(':')
        parts = rest.split()
        if parts and parts[0].isdigit():
            values[key] = int(parts[0]) * (1024 if len(parts) > 1 and parts[1] == 'kB' else 1)
    return values


def sample_frontend_service(state: dict, now: int) -> None:
    unit = 'guidebook-frontend@3000.service'
    result = run(['systemctl', 'show', unit, '-p', 'ActiveState', '-p', 'NRestarts'], 10)
    if result.returncode != 0:
        emit_alert('frontend_service_unavailable', True, {'errorCode': 'systemctl_failed'})
        return
    emit_alert('frontend_service_unavailable', False, {})
    props = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
    emit_alert('frontend_down', props.get('ActiveState') != 'active', {
        'unit': unit,
        'state': props.get('ActiveState'),
    })
    try:
        count = int(props.get('NRestarts') or 0)
    except ValueError:
        count = 0
    old = state.get('frontendRestartCount')
    events = state.get('frontendRestartEvents', [])
    if isinstance(old, int) and count > old:
        events.extend([now] * min(count - old, 20))
    events = [stamp for stamp in events if now - stamp <= 900]
    emit_alert('frontend_restarts', len(events) >= 3, {
        'unit': unit,
        'restartCount15m': len(events),
        'threshold': 3,
    })
    state['frontendRestartCount'] = count
    state['frontendRestartEvents'] = events


def parse_access(line: str) -> tuple[dt.datetime, str, str, int] | None:
    """(time, method, path, status) of one access-log line: JSON (current) or combined (historical)."""
    try:
        if line.startswith('{'):
            record = json.loads(line)
            stamp = dt.datetime.fromisoformat(record['timestamp']).astimezone(dt.timezone.utc)
            return stamp, str(record.get('method', '')), str(record.get('uri', '')), int(record['status'])
        match = ACCESS_RE.search(line)
        if not match:
            return None
        stamp = dt.datetime.strptime(match.group(1), '%d/%b/%Y:%H:%M:%S %z').astimezone(dt.timezone.utc)
        return stamp, match.group(2), match.group(3).split('?')[0], int(match.group(4))
    except (ValueError, KeyError, TypeError):
        return None


def recent_lines(path: Path) -> list[str]:
    """The last TAIL_BYTES of the log (the 5-minute window is far smaller), without reading all of it."""
    with path.open('rb') as stream:
        size = stream.seek(0, os.SEEK_END)
        stream.seek(max(0, size - TAIL_BYTES))
        data = stream.read()
    lines = data.decode(errors='replace').splitlines()
    return lines[1:] if size > TAIL_BYTES else lines


def sample_nginx(now: dt.datetime) -> None:
    if not NGINX_ACCESS.exists():
        emit_alert('nginx_access_unavailable', True, {'errorCode': 'access_log_missing'})
        return
    emit_alert('nginx_access_unavailable', False, {})
    cutoff = now - dt.timedelta(minutes=5)
    requests = errors = beacons = beacons_limited = 0
    try:
        for line in recent_lines(NGINX_ACCESS):
            parsed = parse_access(line)
            if parsed is None or parsed[0] < cutoff:
                continue
            _, method, path, status = parsed
            if path == '/rum':
                beacons += 1
                beacons_limited += status == 429
            requests += 1
            errors += status >= 500
    except OSError:
        emit_alert('nginx_access_unavailable', True, {'errorCode': 'access_log_unreadable'})
        return
    active = errors >= 5 or (requests >= 20 and errors / requests >= 0.05)
    emit_alert('http_5xx_rate_high', active, {
        'windowSeconds': 300,
        'requests': requests,
        'responses5xx': errors,
        'thresholdCount': 5,
        'thresholdRate': 0.05,
    })
    # Real-user beacons rejected with 429 are analytics that never arrive.
    emit_alert('rum_beacons_rate_limited', beacons_limited >= 20 and beacons_limited / max(beacons, 1) >= 0.2, {
        'windowSeconds': 300,
        'beacons': beacons,
        'beacons429': beacons_limited,
        'thresholdCount': 20,
        'thresholdRate': 0.2,
    })


def sample_rum_stats(now: dt.datetime) -> None:
    """Daily real-user checks on the newest complete day in the traffic statistics database."""
    if not STATS_DB.exists():
        return
    try:
        db = sqlite3.connect(f'file:{STATS_DB}?mode=ro', uri=True, timeout=5)
        db.row_factory = sqlite3.Row
        days = db.execute(
            'SELECT date, views, beacons, beacons_limited, view_coverage, browser_pages, wa_clicks, contact_visitors '
            'FROM days ORDER BY date DESC LIMIT 8').fetchall()
        if not days:
            return
        latest = days[0]
        lcp = db.execute("SELECT n, p75 FROM vitals WHERE date = ? AND device = 'all' AND metric = 'lcp_ms'", (latest['date'],)).fetchone()
        db.close()
    except sqlite3.Error:
        return  # an older database without the newer columns: nothing to judge yet
    age = (now.date() - dt.date.fromisoformat(latest['date'])).days
    emit_alert('rum_stats_stale', age > 2, {'lastDay': latest['date'], 'ageDays': age, 'thresholdDays': 2})
    if age > 2:
        return
    # The beacon should see a steady share of page loads; a drop means beacons are being lost
    # (a broken script, a rate limit, a blocked route), not that visitors vanished.
    earlier = [row['view_coverage'] for row in days[1:] if row['view_coverage'] is not None]
    baseline = statistics.median(earlier) if len(earlier) >= 3 else None
    coverage = latest['view_coverage']
    emit_alert('rum_coverage_dropped', bool(
        baseline and coverage is not None and (latest['browser_pages'] or 0) >= 200 and coverage < 0.6 * baseline), {
        'day': latest['date'], 'coverage': coverage, 'baselineMedian': baseline, 'thresholdFactor': 0.6,
    })
    beacons = latest['beacons'] or 0
    limited = latest['beacons_limited'] or 0
    emit_alert('rum_beacons_limited_daily', beacons >= 200 and limited / beacons >= 0.05, {
        'day': latest['date'], 'beacons': beacons, 'beacons429': limited, 'thresholdRate': 0.05,
    })
    emit_alert('rum_lcp_slow', bool(lcp and lcp['n'] >= 50 and lcp['p75'] and lcp['p75'] > 2500), {
        'day': latest['date'], 'lcpP75Ms': lcp['p75'] if lcp else None, 'samples': lcp['n'] if lcp else 0, 'thresholdMs': 2500,
    })
    emit_alert('rum_conversions_zero', (latest['views'] or 0) >= 100 and not (latest['wa_clicks'] or 0) and not (latest['contact_visitors'] or 0), {
        'day': latest['date'], 'views': latest['views'],
    })


def sample_mongo(state: dict, now: int) -> None:
    result = run(['/usr/bin/du', '-sb', str(MONGO_DIR)], 90)
    if result.returncode != 0:
        emit_alert('mongodb_size_unavailable', True, {'errorCode': 'mongodb_du_failed'})
        return
    emit_alert('mongodb_size_unavailable', False, {})
    try:
        size = int(result.stdout.split()[0])
    except (ValueError, IndexError):
        return
    points = state.get('mongoSizeSamples', [])
    if not points or now - int(points[-1][0]) >= 3600:
        points.append([now, size])
        points = points[-1000:]
    state['mongoSizeSamples'] = points
    baseline = next((point for point in points if now - int(point[0]) >= 86400), None)
    growth = size - int(baseline[1]) if baseline else 0
    threshold = max(100 * MIB, int(baseline[1]) // 4) if baseline else 100 * MIB
    emit_alert('mongodb_growth_high', bool(baseline and growth > threshold), {
        'databaseBytes': size,
        'growth24hBytes': max(growth, 0),
        'thresholdBytes': threshold,
        'baselineHours': round((now - int(baseline[0])) / 3600, 1) if baseline else None,
    })


def check() -> None:
    global CURRENT_STATE
    STATE_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    LOG_DIR.mkdir(mode=0o750, parents=True, exist_ok=True)
    state = load_state()
    CURRENT_STATE = state
    now = int(time.time())
    usage = shutil.disk_usage('/')
    used_percent = round((usage.total - usage.free) / usage.total * 100, 1)
    emit_alert('root_disk_high', used_percent >= 85, {
        'usedPercent': used_percent,
        'freeBytes': usage.free,
        'thresholdPercent': 85,
    })
    memory = read_meminfo()
    total = memory.get('MemTotal', 0)
    available = memory.get('MemAvailable', 0)
    available_percent = round(available / total * 100, 1) if total else 100
    emit_alert('memory_available_low', available_percent < 10, {
        'availablePercent': available_percent,
        'availableBytes': available,
        'thresholdPercent': 10,
    })
    swap_total = memory.get('SwapTotal', 0)
    swap_free = memory.get('SwapFree', 0)
    swap_percent = round((swap_total - swap_free) / swap_total * 100, 1) if swap_total else 0
    emit_alert('swap_usage_high', swap_percent >= 85, {
        'usedPercent': swap_percent,
        'thresholdPercent': 85,
    })
    sample_frontend_service(state, now)
    sample_nginx(dt.datetime.now(dt.timezone.utc))
    sample_rum_stats(dt.datetime.now(dt.timezone.utc))
    sample_mongo(state, now)
    save_state(state)
    CURRENT_STATE = None


def snapshot() -> None:
    LOG_DIR.mkdir(mode=0o750, parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')
    targets = [Path('/'), Path('/var'), Path('/var/lib'), Path('/var/lib/mongodb'),
               Path('/var/lib/apport'), Path('/var/log'), Path('/var/www'),
               Path('/root'), Path('/root/.pm2')]
    rows: list[dict] = []
    for target in targets:
        if not target.exists():
            continue
        result = run(['/usr/bin/du', '-x', '-B1', '-s', str(target)], 180)
        if result.returncode != 0:
            continue
        try:
            rows.append({'timestamp': stamp, 'path': str(target), 'bytes': int(result.stdout.split()[0])})
        except (ValueError, IndexError):
            continue
    result = run(['/usr/bin/du', '-x', '-B1', '-d1', '/'], 240)
    if result.returncode == 0:
        for line in result.stdout.splitlines():
            size, _, name = line.partition('\t')
            if name and name != '/':
                try:
                    rows.append({'timestamp': stamp, 'path': name, 'bytes': int(size)})
                except ValueError:
                    pass
    with SIZE_FILE.open('a') as stream:
        for row in rows:
            stream.write(json.dumps(row, separators=(',', ':')) + '\n')


if __name__ == '__main__':
    if len(sys.argv) != 2 or sys.argv[1] not in {'check', 'snapshot'}:
        raise SystemExit('usage: guidebook-health.py check|snapshot')
    check() if sys.argv[1] == 'check' else snapshot()
