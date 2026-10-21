#!/usr/bin/env bash
# Start the FreeLLMAPI gateway in the background (localhost only by default).
set -euo pipefail
D="$HOME/ai-tools/freellmapi"
PIDF="$D/freellmapi.pid"
[ -f "$D/.env" ] || { echo "Missing $D/.env - run ai-tools/setup.sh first." >&2; exit 1; }
if [ -f "$PIDF" ] && kill -0 "$(cat "$PIDF")" 2>/dev/null; then
  echo "Already running (pid $(cat "$PIDF")). Use stop.sh first." >&2; exit 1
fi
cd "$D"
UH="${HOST-}" UP="${PORT-}"   # caller overrides win over .env
set -a; . ./.env; set +a
export HOST="${UH:-127.0.0.1}" NODE_ENV=production
[ -z "$UP" ] || export PORT="$UP"
setsid nohup npm run start -w server >>"$D/freellmapi.log" 2>&1 </dev/null &
echo $! >"$PIDF"
echo "Started (pid $!) on http://$HOST:${PORT:-3001} - log: $D/freellmapi.log"
