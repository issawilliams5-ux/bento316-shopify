# AI Tools — bento316-shopify

External agent tooling for this repo, cloned and built **on demand** by
`setup.sh` into `$WORKDIR` (default `~/ai-tools`) — never vendored into this
tree and never part of the Next.js build. Mirrors the `ai-tools/` convention
in the sibling `bento316-shopify-store` repo.

Nothing here is an application dependency. `package.json`, the Next build, and
the Vercel deploy are untouched by any of it.

## OpenManus (2026-09-02)

[`FoundationAgents/OpenManus`](https://github.com/FoundationAgents/OpenManus)
— MIT, open-source general AI agent (the "Manus without an invite code"
project, from ex-MetaGPT contributors). Python 3.12, an agent loop over a tool
collection, plus MCP client/server support.

**Why it's here:** a headless agent you can point at a task and walk away from
— competitor and pricing research, pulling numbers out of a portal, multi-step
web work — for the ops side of this app. It complements Skyvern (see
`CLAUDE.md`): Skyvern is vision-driven browser automation for a *known,
repeated* flow; OpenManus is a general agent that decides the steps itself.

**Status: installed and boot-verified, not run against a live LLM.** A clean
install into an empty `$WORKDIR` completes, the config loads, and the agent
assembles its local tool stack:

```
tools : ['ask_human', 'python_execute', 'str_replace_editor', 'terminate']
```

The Browser Use MCP server is a **partial** verification: it connected once,
registering `browser_exec` and `browser_screenshot`, but every attempt after
that hung past a 9-minute timeout during the `uvx browser-use --cli-mcp`
handshake. Best read is that browser-use fetches or launches Chromium on
startup and the egress proxy in the install session blocks it. Treat the
browser tools as unproven until you have run `uvx browser-use install` on a
machine with normal network access.

It has **not** completed a real task, because that same proxy blocks
`openrouter.ai` and the tiktoken BPE CDN
(`openaipublic.blob.core.windows.net`, which `tiktoken` fetches on first use).
Both are reachable from a normal machine — expect the first real run to work
there, but that step is genuinely unverified.

### Install

macOS/Linux:

```bash
export OPENROUTER_API_KEY="sk-or-..."   # never commit this
./ai-tools/setup.sh                     # clones to ~/ai-tools/OpenManus
```

Windows (PowerShell):

```powershell
.\ai-tools\setup.ps1                   # prompts for the key if unset
```

`setup.sh` creates a `uv` venv on Python 3.12, installs `requirements.txt`,
renders `openmanus/config.openrouter.toml` into the clone's
`config/config.toml` with your key substituted in, and runs a boot check.

### Run

```bash
cd ~/ai-tools/OpenManus
.venv/bin/python main.py --prompt "Compare pricing pages for <competitors> and summarize the tiers"
```

| Knob | Why you'd touch it |
|---|---|
| `OPENMANUS_DISABLE_BROWSER_USE=1` | Skips the Browser Use MCP server. Use on a headless box, or when you only need the Python/file/search tools. |
| `[llm] model` in `config/config.toml` | Any OpenRouter model id. Default `anthropic/claude-sonnet-4.5`. |
| `[runflow] use_data_analysis_agent` | Enables the DataAnalysis agent in `run_flow.py`. Upstream marks `run_flow.py` unstable — left `false`. |

### Gotchas found during install

- **`[daytona]` is mandatory.** Upstream constructs `DaytonaSettings`
  unconditionally and `daytona_api_key` is a required field, so a config
  without that section dies with a pydantic `ValidationError` before the agent
  starts — even though the Daytona cloud sandbox is unused. The template ships
  an empty value.
- **First browser run is slow, and hangs without network.** `uvx browser-use
  --cli-mcp` resolves and downloads its own dependency tree (~100 packages)
  before the MCP handshake completes, then wants Chromium. Behind a restrictive
  proxy it hangs indefinitely rather than erroring. Pre-warm with `uvx
  browser-use --version` and `uvx browser-use install`; use
  `OPENMANUS_DISABLE_BROWSER_USE=1` if you don't need browser tools.
- **Heavy install.** `requirements.txt` pulls `torch`, `transformers`,
  `datasets`, and `browsergym` — a multi-GB venv. Keep it out of any container
  image you actually deploy.
- **Windows: never `Set-Content -Encoding utf8` for `config.toml`.** Windows
  PowerShell 5.1's `utf8` encoding prepends a UTF-8 byte-order mark, which
  Python's `tomllib` rejects with `Invalid statement (at line 1, column 1)` —
  a config file that looks correct in a text editor but won't parse.
  `ai-tools/setup.ps1` writes it with
  `[System.IO.File]::WriteAllText(..., (New-Object System.Text.UTF8Encoding($false)))`
  instead, which omits the BOM.

**Credentials:** `OPENROUTER_API_KEY` only (see `.env.example`), read from your
environment at setup time. The rendered `config/config.toml` lives in
`~/ai-tools/OpenManus`, outside this repo — keep it that way; it holds the key
in plaintext.

**Cost warning:** an OpenManus run is an autonomous loop, up to 20 steps by
default (`max_steps`), each a full LLM call with the tool results in context. A
single browsing task can cost real money on a frontier model. Start with a
cheap model and a narrow prompt, and check your OpenRouter spend after the
first few runs before scheduling anything recurring.

## screenshot-to-code (2026-09-09)

[`abi/screenshot-to-code`](https://github.com/abi/screenshot-to-code) — MIT.
Turns a screenshot, mockup, Figma export, or screen recording into working
front-end code (HTML+Tailwind, HTML+CSS, React+Tailwind, Vue+Tailwind,
Bootstrap, Ionic+Tailwind). React/Vite frontend talking over WebSocket to a
FastAPI backend.

**Why it's here:** the fastest way to get from "here is a design" to a first
pass of markup for this app's UI work. It is a *design-to-code* tool, not an
agent — it does one shot (plus follow-up edits) and hands you code. Contrast
with OpenManus, which decides its own multi-step plan, and Skyvern, which
drives a browser through a known flow.

**Status: installed and verified serving locally, never run against a live
LLM** — this environment has no model API key, so generation itself is
unverified. Everything up to the generate call works.

| Piece | Command | Port |
|---|---|---|
| Backend (FastAPI) | `poetry run uvicorn main:app --port 7001` in `backend/` | **7001** |
| Frontend (Vite) | `pnpm dev` in `frontend/` | **5173** |

Open http://localhost:5173. `GET /` on the backend returns a plain "your
backend is running correctly" page — that is the health check.

**Keys** — at least one of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
`GEMINI_API_KEY`. `GEMINI_API_KEY` is the one upstream recommends: it powers
asset extraction (reusing the real logos and images out of your screenshot) and
is required for video/screen-recording mode. `REPLICATE_API_KEY` unlocks image
generation, editing, and background removal. `setup.sh` writes whichever of
these are set in your environment into `backend/.env` (mode 600); they can also
be pasted into the app's own settings dialog at runtime. Replicate is
`.env`-only.

**Gotchas**

- **`backend/.env` holds keys in plaintext** in `~/ai-tools`, outside this
  repo. Keep it there. `setup.sh` only writes the vars that are actually set,
  so a re-run in a narrower shell will not blank out a key you added by hand.
- **Chromium is optional.** The backend has a "screenshot preview" tool that
  renders its own generated page headlessly and looks at it. Without Chromium
  the backend logs `[screenshot_preview] Chromium unavailable — tool disabled`
  and carries on. `setup.sh` attempts `playwright install chromium` and treats
  failure as non-fatal; on Linux you may need
  `poetry run playwright install --with-deps chromium` (needs sudo/apt).
- **pnpm, not npm.** `frontend/package.json` pins `packageManager:
  pnpm@10.32.1`. `corepack enable pnpm` if you don't have it.
- **`pnpm install` reports "Ignored build scripts: esbuild, puppeteer".** This
  is pnpm's default postinstall sandboxing, not a failure — the dev server
  starts fine. Only run `pnpm approve-builds` if you hit a missing binary.

## OpenUI (2026-09-09)

[`wandb/openui`](https://github.com/wandb/openui) — Apache-2.0, from Weights &
Biases. Describe a component in words, watch it render live, iterate in chat,
then convert the HTML to React/Svelte/Web Components. An open v0.

**Why it's here vs. screenshot-to-code:** OpenUI starts from a *prompt* and is
built for iterating on one component conversationally; screenshot-to-code
starts from an *image* of a whole screen. Reach for OpenUI when there is no
mockup yet.

**Status: installed and verified serving locally, never run against a live
LLM** — same key situation as above.

| Piece | Command | Port |
|---|---|---|
| Everything | `.venv/bin/python -m openui` in `backend/` | **7878** |

One process. The backend serves a **prebuilt** frontend out of
`backend/openui/dist`, so there is no frontend build step — `npm run dev` on
5173 is only for hacking on OpenUI itself. Open http://localhost:7878; `GET /`
returning the app shell is the health check.

**Keys** — read from the process environment at *run* time, not install time,
so nothing secret is written to disk by `setup.sh`. Any of `OPENAI_API_KEY`,
`ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `COHERE_API_KEY`,
`MISTRAL_API_KEY`, or `OPENAI_COMPATIBLE_ENDPOINT` + `OPENAI_COMPATIBLE_API_KEY`.
Pick the model in the app's settings gear. Local Ollama also works via
`OLLAMA_HOST` (llava is one of the few Ollama models that accept images).

**Gotchas**

- **`--extra litellm` is not optional if you want anything but
  OpenAI/Anthropic/Groq.** `setup.sh` installs it. It pulls LiteLLM (and with
  it `sentry-sdk` and `wandb`), which is a chunk of the install size.
- **It talks to the network on its own.** The prebuilt frontend ships a Sentry
  DSN and the backend links against `wandb`/`weave`; behind a restrictive
  egress proxy you will see failed connections to `ingest.*.sentry.io` in the
  log. They are non-fatal — the app serves fine — but be aware before pointing
  it at anything sensitive.
- **Port is fixed by env, not a flag.** `PORT=7878` by default; set `PORT` to
  move it. It binds `127.0.0.1` unless it detects it is in Docker.
- **`uv sync --frozen` provisions its own Python** if the locked version isn't
  on the box, so this step does not need a system interpreter of a particular
  version.

## Running both at once

Ports don't collide: screenshot-to-code is 7001 + 5173, OpenUI is 7878, and
this app's Next dev server is 3000. Nothing here is on the Next.js build path
or the Vercel deploy.
