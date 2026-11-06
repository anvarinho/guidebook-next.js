#!/usr/bin/env python3
"""Small, dependency-free GuideBook VPS health sampler."""

from __future__ import annotations

import datetime as dt
import json
import os
import re
import shutil
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
MIB = 1024 * 1024
GIB = 1024 * MIB
ACCESS_RE = re.compile(r'\[([^]]+)\]\s+"[A-Z]+\s[^\"]*"\s+(\d{3})\s')
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


def pm2_binary() -> str | None:
    result = run(['/bin/bash', '-lc', 'command -v pm2'], 10)
    return result.stdout.strip() if result.returncode == 0 and result.stdout.strip() else shutil.which('pm2')


def sample_pm2(state: dict, now: int) -> None:
    binary = pm2_binary()
    if not binary:
        emit_alert('pm2_metrics_unavailable', True, {'errorCode': 'pm2_not_found'})
        return
    result = run([binary, 'jlist'], 15)
    if result.returncode != 0:
        emit_alert('pm2_metrics_unavailable', True, {'errorCode': 'pm2_query_failed'})
        return
    try:
        processes = json.loads(result.stdout)
    except json.JSONDecodeError:
        emit_alert('pm2_metrics_unavailable', True, {'errorCode': 'pm2_json_invalid'})
        return
    emit_alert('pm2_metrics_unavailable', False, {})
    previous = state.get('pm2RestartCounts', {})
    events = state.get('pm2RestartEvents', {})
    current: dict[str, int] = {}
    for process in processes:
        env = process.get('pm2_env') or {}
        name = str(env.get('name') or '')
        if not name or name.startswith('pm2-'):
            continue
        count = int(env.get('restart_time') or 0)
        current[name] = count
        old = previous.get(name)
        if isinstance(old, int) and count > old:
            events.setdefault(name, []).extend([now] * min(count - old, 20))
        events[name] = [stamp for stamp in events.get(name, []) if now - stamp <= 900]
        restarted = len(events[name]) >= 3
        emit_alert(f'pm2_restarts_{name}', restarted, {
            'process': name,
            'restartCount15m': len(events[name]),
            'threshold': 3,
        })
    state['pm2RestartCounts'] = current
    state['pm2RestartEvents'] = events


def sample_nginx(now: dt.datetime) -> None:
    if not NGINX_ACCESS.exists():
        emit_alert('nginx_access_unavailable', True, {'errorCode': 'access_log_missing'})
        return
    emit_alert('nginx_access_unavailable', False, {})
    cutoff = now - dt.timedelta(minutes=5)
    requests = errors = 0
    try:
        with NGINX_ACCESS.open(errors='replace') as stream:
            for line in stream:
                match = ACCESS_RE.search(line)
                if not match:
                    continue
                try:
                    stamp = dt.datetime.strptime(match.group(1), '%d/%b/%Y:%H:%M:%S %z').astimezone(dt.timezone.utc)
                except ValueError:
                    continue
                if stamp < cutoff:
                    continue
                requests += 1
                errors += int(match.group(2).startswith('5'))
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
    sample_pm2(state, now)
    sample_nginx(dt.datetime.now(dt.timezone.utc))
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
