#!/usr/bin/env bash
# Stop the FreeLLMAPI gateway started by start.sh (by pid file only).
set -euo pipefail
PIDF="$HOME/ai-tools/freellmapi/freellmapi.pid"
[ -f "$PIDF" ] || { echo "Not running (no pid file)."; exit 0; }
PID="$(cat "$PIDF")"
if kill -0 "$PID" 2>/dev/null; then
  kill -- "-$PID" 2>/dev/null || kill "$PID"   # start.sh made it a process-group leader
  echo "Stopped (pid $PID)."
else
  echo "Not running (stale pid file)."
fi
rm -f "$PIDF"
