#!/usr/bin/env python3
"""Create atomic, compressed GuideBook MongoDB backups using the API service URI."""

from __future__ import annotations

import datetime as dt
import gzip
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import unquote, urlsplit

BACKUP_DIR = Path('/var/backups/guidebook/mongodb')
SERVICE = 'guidebook-rust-api.service'


def mongo_uri_from_service() -> str:
    pid = subprocess.check_output(
        ['/usr/bin/systemctl', 'show', '--property=MainPID', '--value', SERVICE], text=True
    ).strip()
    if not pid.isdigit() or pid == '0':
        raise RuntimeError('GuideBook API service is not running')
    env = Path(f'/proc/{pid}/environ').read_bytes().split(b'\0')
    entry = next((item for item in env if item.startswith(b'MONGODB_URI=')), None)
    if entry is None:
        raise RuntimeError('MONGODB_URI is not present in the API service environment')
    uri = entry.split(b'=', 1)[1].decode()
    parsed = urlsplit(uri)
    database = unquote(parsed.path.lstrip('/'))
    if parsed.scheme not in {'mongodb', 'mongodb+srv'} or not database or not re.fullmatch(r'[A-Za-z0-9_-]+', database):
        raise RuntimeError('MONGODB_URI must name a single database')
    return uri


def main() -> None:
    BACKUP_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chmod(BACKUP_DIR, 0o700)
    uri = mongo_uri_from_service()
    now = dt.datetime.now(dt.timezone.utc)
    name = f"guidebook-{now.strftime('%Y%m%dT%H%M%SZ')}.archive.gz"
    final = BACKUP_DIR / name
    with tempfile.TemporaryDirectory(prefix='guidebook-mongodump-', dir=BACKUP_DIR) as temp_dir:
        config = Path(temp_dir) / 'mongodump.yaml'
        config.write_text('uri: ' + json.dumps(uri) + '\n')
        os.chmod(config, 0o600)
        tmp_archive = BACKUP_DIR / (name + '.partial')
        try:
            result = subprocess.run(
                ['/usr/bin/mongodump', '--config', str(config), '--archive', str(tmp_archive), '--gzip', '--quiet'],
                timeout=1800,
                check=False,
            )
            if result.returncode != 0 or not tmp_archive.is_file() or tmp_archive.stat().st_size < 1_000_000:
                raise RuntimeError('mongodump failed or produced an unexpectedly small archive')
            with gzip.open(tmp_archive, 'rb') as archive:
                archive.read(1)
            os.chmod(tmp_archive, 0o600)
            os.replace(tmp_archive, final)
        finally:
            tmp_archive.unlink(missing_ok=True)
    archives = sorted(BACKUP_DIR.glob('guidebook-*.archive.gz'), key=lambda path: path.stat().st_mtime, reverse=True)
    for stale in archives[14:]:
        stale.unlink()
    metadata = {
        'timestamp': now.isoformat(timespec='seconds'),
        'backup': str(final),
        'bytes': final.stat().st_size,
        'retentionCount': 14,
        'result': 'success',
    }
    metadata_path = BACKUP_DIR / 'latest-run.json'
    tmp_metadata = metadata_path.with_suffix('.tmp')
    tmp_metadata.write_text(json.dumps(metadata, indent=2) + '\n')
    os.chmod(tmp_metadata, 0o600)
    os.replace(tmp_metadata, metadata_path)
    print(json.dumps(metadata, separators=(',', ':')))


if __name__ == '__main__':
    main()
