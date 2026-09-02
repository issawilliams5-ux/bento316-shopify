#!/usr/bin/env bash
# Installer for the external agent tooling documented in ai-tools/README.md.
# Same pattern as the sibling bento316-shopify-store repo: cloned and built on
# demand into $WORKDIR, never vendored into this tree. Safe to re-run.
set -euo pipefail

# Resolve this script's own directory before any cd, so the config template
# below is found no matter where setup.sh is invoked from.
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

WORKDIR="${1:-$HOME/ai-tools}"
mkdir -p "$WORKDIR"
cd "$WORKDIR"

echo "==> 1/1 OpenManus"
missing=""
command -v uv >/dev/null 2>&1 || missing="$missing uv(https://astral.sh/uv/install.sh)"
command -v python3.12 >/dev/null 2>&1 || missing="$missing python3.12"
if [ -n "$missing" ]; then
  echo "    skipped - missing:$missing"
  exit 1
fi

if [ ! -d OpenManus ]; then
  git clone --depth 1 https://github.com/FoundationAgents/OpenManus.git
fi
cd OpenManus
[ -d .venv ] || uv venv --python 3.12
uv pip install -r requirements.txt

# Render the OpenRouter config. The key is substituted from the environment so
# it never lands in git; without one you get a placeholder to fill in by hand.
if [ -n "${OPENROUTER_API_KEY:-}" ]; then
  sed "s|__OPENROUTER_API_KEY__|$OPENROUTER_API_KEY|g" \
    "$REPO_DIR/openmanus/config.openrouter.toml" > config/config.toml
  echo "    config/config.toml written with \$OPENROUTER_API_KEY"
elif [ ! -f config/config.toml ]; then
  cp "$REPO_DIR/openmanus/config.openrouter.toml" config/config.toml
  echo "    WARNING: \$OPENROUTER_API_KEY unset - edit config/config.toml and"
  echo "             replace __OPENROUTER_API_KEY__ before running the agent."
else
  echo "    config/config.toml already exists - left untouched"
fi

# Boot check: catches config-schema breakage (e.g. the required [daytona]
# section) without spending a token on the LLM.
OPENMANUS_DISABLE_BROWSER_USE=1 .venv/bin/python -c \
  "from app.config import config; print('    config OK ->', config.llm['default'].model)"

cat <<EOF

Done. Run a task with:
  cd $WORKDIR/OpenManus
  .venv/bin/python main.py --prompt "<your task>"

The first run starts the Browser Use MCP server via \`uvx browser-use --cli-mcp\`,
which downloads its own dependency tree and can take several minutes. Set
OPENMANUS_DISABLE_BROWSER_USE=1 to skip the browser tools.
EOF
