#!/bin/sh
# Chrome for headless skill scripts in a cloud container (motionmaxxing's render.mjs,
# taste-skill's inspector): the preinstalled Chromium, without its update/phone-home
# traffic, plus --no-sandbox only as root.
# Usage: export CHROME_PATH="$PWD/.claude/helpers/chrome-root.sh"
exe="${MCP_BROWSER_PATH:-/opt/pw-browsers/chromium}"
set -- --disable-background-networking --disable-component-update "$@"
[ "$(id -u)" = 0 ] && exec "$exe" --no-sandbox "$@"
exec "$exe" "$@"
