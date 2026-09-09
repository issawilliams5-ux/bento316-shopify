#!/usr/bin/env bash
# Installer for the external agent tooling documented in ai-tools/README.md.
# Same pattern as the sibling bento316-shopify-store repo: cloned and built on
# demand into $WORKDIR, never vendored into this tree. Safe to re-run.
set -uo pipefail

# Resolve this script's own directory before any cd, so the config template
# below is found no matter where setup.sh is invoked from.
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

WORKDIR="${1:-$HOME/ai-tools}"
mkdir -p "$WORKDIR"

SKIPPED=""
FAILED=""

# Print the missing entries from a list of "command|hint" pairs; empty = all present.
missing_of() {
  local out="" pair
  for pair in "$@"; do
    command -v "${pair%%|*}" >/dev/null 2>&1 || out="$out ${pair##*|}"
  done
  printf '%s' "$out"
}

# Clone once, then leave alone. Re-running never clobbers local edits. A
# directory with no .git is the debris of an interrupted clone, not your work,
# so it is discarded rather than left to block every future run.
clone_once() {
  if [ -d "$2" ] && [ ! -d "$2/.git" ]; then
    echo "    discarding partial clone at $2"
    rm -rf "$2"
  fi
  [ -d "$2/.git" ] || git clone --depth 1 "$1" "$2"
}

# ---------------------------------------------------------------- OpenManus --
step_openmanus() {
  local dir="$WORKDIR/OpenManus"
  local miss
  miss="$(missing_of "git|git" "uv|uv(https://astral.sh/uv/install.sh)" "python3.12|python3.12")"
  if [ -n "$miss" ]; then
    echo "    skipped - missing:$miss"
    SKIPPED="$SKIPPED OpenManus"
    return 0
  fi

  clone_once https://github.com/FoundationAgents/OpenManus.git "$dir" || return 1
  cd "$dir" || return 1
  [ -d .venv ] || uv venv --python 3.12 || return 1
  uv pip install -r requirements.txt || return 1

  # Render the OpenRouter config. The key is substituted from the environment so
  # it never lands in git; without one you get a placeholder to fill in by hand.
  if [ -n "${OPENROUTER_API_KEY:-}" ]; then
    sed "s|__OPENROUTER_API_KEY__|$OPENROUTER_API_KEY|g" \
      "$REPO_DIR/openmanus/config.openrouter.toml" > config/config.toml || return 1
    chmod 600 config/config.toml
    echo "    config/config.toml written with \$OPENROUTER_API_KEY"
  elif [ ! -f config/config.toml ]; then
    cp "$REPO_DIR/openmanus/config.openrouter.toml" config/config.toml || return 1
    chmod 600 config/config.toml
    echo "    WARNING: \$OPENROUTER_API_KEY unset - edit config/config.toml and"
    echo "             replace __OPENROUTER_API_KEY__ before running the agent."
  else
    echo "    config/config.toml already exists - left untouched"
  fi

  # Boot check: catches config-schema breakage (e.g. the required [daytona]
  # section) without spending a token on the LLM.
  OPENMANUS_DISABLE_BROWSER_USE=1 .venv/bin/python -c \
    "from app.config import config; print('    config OK ->', config.llm['default'].model)"
}

# -------------------------------------------------------- screenshot-to-code --
# FastAPI backend on :7001 (poetry, Python >=3.10) + React/Vite frontend on
# :5173 (pnpm). Keys live in backend/.env, or can be pasted into the app's
# settings dialog at runtime.
step_screenshot_to_code() {
  local dir="$WORKDIR/screenshot-to-code"
  local miss
  miss="$(missing_of "git|git" "poetry|poetry(pip install --upgrade poetry)" "pnpm|pnpm(corepack enable pnpm)")"
  if [ -n "$miss" ]; then
    echo "    skipped - missing:$miss"
    SKIPPED="$SKIPPED screenshot-to-code"
    return 0
  fi

  clone_once https://github.com/abi/screenshot-to-code.git "$dir" || return 1

  cd "$dir/backend" || return 1
  # pyproject asks for ^3.10; pin explicitly so poetry does not pick a stray
  # interpreter that fails to resolve.
  local py
  for py in python3.13 python3.12 python3.11 python3.10; do
    command -v "$py" >/dev/null 2>&1 && { poetry env use "$py" >/dev/null || true; break; }
  done
  poetry install --no-interaction || return 1

  # Render backend/.env from whatever keys are in the environment. Only the ones
  # actually set are written, so a re-run with a narrower environment does not
  # silently blank out keys you added by hand.
  local wrote=""
  local k
  for k in OPENAI_API_KEY ANTHROPIC_API_KEY GEMINI_API_KEY REPLICATE_API_KEY; do
    [ -n "${!k:-}" ] && wrote="$wrote $k"
  done
  if [ -n "$wrote" ]; then
    : > .env.new
    for k in OPENAI_API_KEY ANTHROPIC_API_KEY GEMINI_API_KEY REPLICATE_API_KEY; do
      [ -n "${!k:-}" ] && printf '%s=%s\n' "$k" "${!k}" >> .env.new
    done
    mv .env.new .env
    chmod 600 .env
    echo "    backend/.env written with:$wrote"
  elif [ ! -f .env ]; then
    : > .env
    chmod 600 .env
    echo "    WARNING: no model key in the environment. The backend still boots;"
    echo "             set a key in $dir/backend/.env or via the app's settings"
    echo "             dialog before generating anything."
  else
    echo "    backend/.env already exists - left untouched"
  fi

  # Optional: headless Chromium lets the agent screenshot and visually check its
  # own output. Missing Chromium only disables that one tool, so never fatal.
  poetry run playwright install chromium >/dev/null 2>&1 \
    || echo "    note: playwright chromium not installed - screenshot preview stays off"

  cd "$dir/frontend" || return 1
  pnpm install || return 1
  poetry -C "$dir/backend" run python -c "import main; print('    backend imports OK')" || return 1
}

# -------------------------------------------------------------------- OpenUI --
# Single Python service on :7878 that also serves its prebuilt frontend, so
# there is no separate frontend build step. Keys are read from the environment
# at *run* time, not install time - nothing secret is written to disk here.
step_openui() {
  local dir="$WORKDIR/openui"
  local miss
  miss="$(missing_of "git|git" "uv|uv(https://astral.sh/uv/install.sh)")"
  if [ -n "$miss" ]; then
    echo "    skipped - missing:$miss"
    SKIPPED="$SKIPPED openui"
    return 0
  fi

  clone_once https://github.com/wandb/openui.git "$dir" || return 1
  cd "$dir/backend" || return 1
  # --frozen: install exactly the locked versions. --extra litellm: adds the
  # LiteLLM proxy so Gemini/Mistral/Cohere/local endpoints work, not just
  # OpenAI/Anthropic/Groq. uv provisions its own interpreter if needed.
  uv sync --frozen --extra litellm || return 1
  [ -d openui/dist ] || { echo "    ERROR: prebuilt frontend (backend/openui/dist) missing"; return 1; }
  .venv/bin/python -c "import openui.server; print('    server imports OK')" || return 1
}

run_step() {
  echo "==> $1"
  if ( set -e; "$2" ); then :; else
    echo "    FAILED: $3"
    FAILED="$FAILED $3"
  fi
}

run_step "1/3 OpenManus"           step_openmanus          OpenManus
run_step "2/3 screenshot-to-code"  step_screenshot_to_code screenshot-to-code
run_step "3/3 OpenUI"              step_openui             openui

cat <<EOF

------------------------------------------------------------------
OpenManus - headless agent (no port; CLI)
  cd $WORKDIR/OpenManus
  .venv/bin/python main.py --prompt "<your task>"

  First run starts the Browser Use MCP server via \`uvx browser-use --cli-mcp\`,
  which downloads its own dependency tree and can take several minutes. Set
  OPENMANUS_DISABLE_BROWSER_USE=1 to skip the browser tools.

screenshot-to-code - two processes, open http://localhost:5173
  cd $WORKDIR/screenshot-to-code/backend && poetry run uvicorn main:app --port 7001
  cd $WORKDIR/screenshot-to-code/frontend && pnpm dev          # :5173

OpenUI - one process, open http://localhost:7878
  cd $WORKDIR/openui/backend
  OPENAI_API_KEY=... ANTHROPIC_API_KEY=... .venv/bin/python -m openui

Both UI tools need a vision-capable model key to generate anything.
See ai-tools/README.md and .env.example.
------------------------------------------------------------------
EOF

[ -n "$SKIPPED" ] && echo "Skipped (missing prerequisites):$SKIPPED"
if [ -n "$FAILED" ]; then
  echo "Failed:$FAILED - re-run after fixing; completed steps are picked up in place."
  exit 1
fi
echo "Done."
