#!/usr/bin/env python3
"""Export task-scoped Codex usage snapshots; never estimate unavailable counters.

Only reads metadata, timestamps and token counters. Conversation text is not exported.
Cached and reasoning counters are breakdowns, not additional total-token charges.
"""
import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path

COUNTERS = ('input_tokens', 'cached_input_tokens', 'cache_write_input_tokens',
            'output_tokens', 'reasoning_output_tokens', 'total_tokens')
MISSING = 'nedostupné'


def instant(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def session_data(path):
    metadata, snapshots, completed_at = {}, [], None
    with path.open(encoding='utf-8') as source:
        for line in source:
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue  # A running session may end in a partial line.
            payload = item.get('payload', {})
            if item.get('type') == 'session_meta':
                metadata = {**payload, 'started_at': item.get('timestamp')}
            elif item.get('type') == 'turn_context':
                metadata['model'] = payload.get('model')
                metadata['reasoning'] = payload.get('effort')
            elif item.get('type') == 'event_msg':
                if payload.get('type') == 'token_count':
                    counts = (payload.get('info') or {}).get('total_token_usage')
                    if counts is not None:
                        snapshots.append((instant(item['timestamp']), counts))
                elif payload.get('type') == 'task_complete':
                    completed_at = item.get('timestamp')
    return metadata, snapshots, completed_at


def interval_usage(snapshots, started_at, ended_at):
    """Sum deltas once, ignoring duplicate cumulative snapshots and handling resets."""
    previous = dict.fromkeys(COUNTERS, 0)
    totals = dict.fromkeys(COUNTERS, 0)
    available = set()
    measured_through = None
    resets = False
    for timestamp, counts in snapshots:
        if timestamp > ended_at:
            break
        if timestamp < started_at:
            previous = counts
            continue
        for key in COUNTERS:
            value = counts.get(key)
            if not isinstance(value, int):
                continue
            old = previous.get(key, 0)
            if not isinstance(old, int):
                old = 0
            if value < old:
                resets = True
            totals[key] += value - old if value >= old else value
            available.add(key)
        previous = counts
        measured_through = timestamp.isoformat()
    return {key: totals[key] if key in available else MISSING for key in COUNTERS}, measured_through, resets


def export_report(manifest_path, output_path, sessions_root):
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    now = datetime.now(timezone.utc)
    by_agent = {}
    # Sessions are selected by exact root/parent identity, not by project name.
    for path in sessions_root.rglob('*.jsonl'):
        try:
            with path.open(encoding='utf-8') as source:
                header = json.loads(source.readline())
            meta = header.get('payload', {})
            source_kind = meta.get('source', {})
            spawn = source_kind.get('subagent', {}).get('thread_spawn', {}) if isinstance(source_kind, dict) else {}
            if meta.get('id') == manifest['root_thread_id']:
                by_agent['/root'] = path
            elif spawn.get('parent_thread_id') == manifest['root_thread_id']:
                by_agent[spawn.get('agent_path')] = path
        except (OSError, json.JSONDecodeError):
            continue
    rows = []
    for task in manifest['tasks']:
        path = by_agent.get(task['agent'])
        meta, snapshots, completion = session_data(path) if path else ({}, [], None)
        started = task.get('started_at') or meta.get('started_at')
        # Reused agent tasks must have explicit non-overlapping time boundaries.
        finished = task.get('finished_at') or (completion if task.get('status') == 'completed' else None)
        end = instant(finished) if finished else now
        values, through, resets = interval_usage(snapshots, instant(started), end) if started else (dict.fromkeys(COUNTERS, MISSING), None, False)
        coverage = 'measured' if through else 'unavailable'
        if through and (task.get('status') != 'completed' or task['agent'] == '/root'):
            coverage = 'partial_snapshot'
        notes = task.get('notes', '')
        if task['agent'] == '/root':
            notes += ' Coordinator snapshot excludes work after measured_through, including the final chat response.'
        if resets:
            notes += ' Cumulative counter reset observed; positive segments summed.'
        rows.append({
            'task_id': task['task_id'], 'agent': task['agent'], 'task': task['task'],
            'model': meta.get('model') or task['model'], 'reasoning': meta.get('reasoning') or task['reasoning'], 'status': task['status'],
            'started_at_utc': started or MISSING, 'finished_at_utc': finished or MISSING,
            'duration_seconds': round((end - instant(started)).total_seconds(), 1) if started else MISSING,
            **values, 'usage_status': coverage, 'measured_through_utc': through or MISSING,
            'session_id': meta.get('id', MISSING), 'result': task.get('result', ''), 'notes': notes.strip(),
        })
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open('w', encoding='utf-8-sig', newline='') as output:
        writer = csv.DictWriter(output, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    for row in rows:
        print(f"{row['task_id']}: {row['status']} | {row['total_tokens']} tokens | {row['usage_status']}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, default=Path('docs/agent-tasks.json'))
    parser.add_argument('--output', type=Path, default=Path('docs/agent-usage.csv'))
    parser.add_argument('--sessions-root', type=Path, default=Path.home() / '.codex/sessions')
    options = parser.parse_args()
    export_report(options.manifest, options.output, options.sessions_root)
