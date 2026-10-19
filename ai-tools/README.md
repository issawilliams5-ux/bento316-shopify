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

## MoneyPrinterV2 (2026-09-24)

[`FujiwaraChoki/MoneyPrinterV2`](https://github.com/FujiwaraChoki/MoneyPrinterV2)
— **AGPL-3.0**, a complete rewrite of the original MoneyPrinter with a modular
architecture. Four features: a Twitter/X bot, a YouTube Shorts automator (both
with CRON schedulers), Amazon affiliate marketing posts, and local-business
scraping for cold outreach. Python **3.12** — upstream says 3.13 does not work.

**Why it's here:** it is the only tool in this directory that owns the whole
publish loop — generate a short, caption it, post it, and keep posting on a
schedule. `ai-video-studio-kit` cuts clips, HyperFrames renders them, OpenManus
researches; MoneyPrinterV2 is the piece that puts something on an account
every day without a human in the loop. That is also exactly why it is the most
dangerous thing here, so read the guardrails below before you enable a job.

### Status: installed and verified (2026-09-24)

Installed clean into `~/ai-tools/MoneyPrinterV2` by `setup.sh` on Python
**3.12.3**, all requirements resolved, `config.json` seeded at `0600`, the
`config` module imports, and upstream's own `scripts/preflight_local.py` runs.
It has **not** produced or posted anything — no credentials were configured and
nothing was pointed at a live account.

**Budget ~6.3 GB of disk.** `requirements.txt` pulls `faster-whisper`, which
drags in `torch` plus the full set of NVIDIA CUDA wheels (`nvidia-cublas`,
`cusolver`, `cusparse`, `triton`, …) whether or not there is a GPU. That is the
single biggest install in `ai-tools/`.

**Upstream has moved well past the feature list in its own README.** What the
code actually wants, read off `config.example.json` and the preflight:

| Concern | What it uses |
|---|---|
| LLM | **Ollama**, local, `ollama_base_url` (default `http://127.0.0.1:11434`) + `ollama_model` — not OpenRouter, not an API key |
| Images | **Nano Banana 2** via Google's `generativelanguage` endpoint — `nanobanana2_api_key`, or `GEMINI_API_KEY` in the environment |
| Speech-to-text | `stt_provider` — local `faster-whisper` (`whisper_model`/`device`/`compute_type`) or **AssemblyAI** (`assembly_ai_api_key`) |
| Posting | `post_bridge` (see `src/post_bridge_integration.py`) **plus a real `firefox_profile`** — the X/YouTube automation drives a logged-in Firefox, so there are no platform API keys to paste |
| Outreach | `google_maps_scraper` + `google_maps_scraper_niche`, `scraper_timeout`, and an `email` block with `outreach_message_subject` / `outreach_message_body_file` |
| Subtitles/render | `imagemagick_path`, `font`, `threads`, `script_sentence_length` |

Scheduling lives in `src/cron.py`; the entry point is `src/main.py`. `scripts/`
holds three things, not a menu: `preflight_local.py`, `setup_local.sh`,
`upload_video.sh`.

### What the preflight reported here, unconfigured

```
[WARN] imagemagick_path is not set to a valid executable path...   <- fixed, see below
[WARN] firefox_profile is empty. Twitter/YouTube automation requires this.
[FAIL] Ollama is not reachable at http://127.0.0.1:11434
[FAIL] nanobanana2_api_key is empty (and GEMINI_API_KEY is not set)
[OK]   faster-whisper is installed
[OK]   Nano Banana 2 base URL reachable
```

Every one of those is expected on a fresh install — it is a report, not a gate,
and it exits 0 either way. Re-run it after editing `config.json`:

```bash
cd ~/ai-tools/MoneyPrinterV2 && .venv/bin/python scripts/preflight_local.py
```

### Host dependencies the installer does not provide

These are `apt` packages, not Python ones, so `setup.sh` does not install them
— and each one silently limits a feature rather than failing loudly.

Installed here on 2026-09-29 with `apt-get install -y ffmpeg imagemagick`:

- **ffmpeg 6.1.1** — present. Verified end to end: ffmpeg encodes, and
  MoviePy 2.1.2 opens the result.
- **ImageMagick 6.9.12** (`/usr/bin/convert`) — present, and `config.json`'s
  `imagemagick_path` now points at it, which clears the preflight warning.
  Note it is the **ImageMagick 6** line, so the binary is `convert`, not
  `magick`; on a host with ImageMagick 7 that path is `/usr/bin/magick`.

Still absent:

- **Firefox** — no `firefox_profile` means no X/YouTube posting.
- **Go** — present (`/usr/local/go/bin/go`), needed only for cold outreach.

The two remaining preflight blockers are configuration, not packages: an
unreachable local Ollama and an empty `nanobanana2_api_key`/`GEMINI_API_KEY`.

### Install

**Windows is the right host for this tool**, and the reason is not preference:
the posting path needs a logged-in **Firefox profile**, and the LLM is a
**local Ollama**. Both live on a desktop you actually sign in on. A cloud
container has neither, and cannot get them.

There is no PowerShell installer for this tool — `setup.ps1` stays
OpenManus-only. These are the commands it would run, and they are short enough
that an untested 100-line script would add risk rather than remove it.

```powershell
# 1. Host dependencies. Verify the IDs first with `winget search <name>`.
winget install Python.Python.3.12
winget install Gyan.FFmpeg
winget install ImageMagick.ImageMagick
winget install Ollama.Ollama          # skip if you already have it

# 2. The tool itself
git clone --depth 1 https://github.com/FujiwaraChoki/MoneyPrinterV2.git $HOME\ai-tools\MoneyPrinterV2
cd $HOME\ai-tools\MoneyPrinterV2
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item config.example.json config.json
```

Open a **new** terminal after the winget installs so `PATH` picks them up, then
confirm: `ffmpeg -version`, `magick -version`, `ollama list`.

Then fill in `config.json`. Nothing prefills it — the field names are
upstream's to define, and guessing them produces a file that looks right and
silently does the wrong thing. The four that matter:

| Field | Windows value |
|---|---|
| `ollama_base_url` | `http://127.0.0.1:11434` — correct as shipped when Ollama runs on the same box |
| `ollama_model` | a tag from your own `ollama list`, e.g. `llama3.1:8b`. Empty by default |
| `imagemagick_path` | the **ImageMagick 7** binary, `C:\Program Files\ImageMagick-7.x.x-Q16-HDRI\magick.exe` — `magick.exe`, not the `convert.exe` a Linux host uses |
| `firefox_profile` | `%APPDATA%\Mozilla\Firefox\Profiles\<something>.default-release`. Find yours from `about:profiles` in Firefox — the one whose "Root Directory" it lists |

JSON needs backslashes escaped: `"C:\\Program Files\\..."`.

The Firefox profile must be **logged in to the accounts it will post from**, so
sign in once in that profile by hand first. Firefox also cannot run the same
profile twice — close the browser before a run, or the automation will fail to
attach.

### Run

```powershell
cd $HOME\ai-tools\MoneyPrinterV2
.\.venv\Scripts\python.exe scripts\preflight_local.py   # check config before anything else
.\.venv\Scripts\python.exe src\main.py                  # interactive menu
```

macOS/Linux (this repo's installer handles it as step 4 of 4):

```bash
./ai-tools/setup.sh                   # $WORKDIR defaults to ~/ai-tools
cd ~/ai-tools/MoneyPrinterV2
.venv/bin/python scripts/preflight_local.py
.venv/bin/python src/main.py
```

### Guardrails

These are not optional, and they are the reason this tool is documented rather
than scheduled:

- **`config.json` is a credential file** — API keys plus social account logins.
  It lives in `$WORKDIR` at `0600` and must never be copied into this repo or
  pasted into an issue, a PR, or a chat.
- **Every scheduler feature posts to a live account.** Run each feature once
  by hand and read what it produced before you let CRON near it. Use a burner
  account while you are still learning what it writes.
- **Automated posting is against some platforms' terms.** Whether a bot may
  post, and how often, is the account owner's call and the platform's rule —
  check both before scheduling, and never point it at a client's account
  without written say-so.
- **The cold-outreach feature scrapes local businesses and e-mails them.**
  That is regulated (GDPR, CAN-SPAM). Do not send from it without a lawful
  basis, a real sender identity, and a working unsubscribe path.
- **Generated content still needs a human read.** Unreviewed LLM output on a
  brand account is a brand risk, not a time saving.
- **AGPL-3.0 is viral over a network.** Running it internally is fine; if any
  of it ends up serving users, the AGPL's source-disclosure obligation lands on
  whatever it is linked into. Keep it in `$WORKDIR` as a standalone tool —
  which is what the `setup.sh` pattern already does — and do not import its
  code into this codebase.

### Gotchas

- `python3.12` specifically. On a box where `python3` is 3.13, the installer
  skips the step rather than building a venv that breaks later.
- The clone ships its own `CLAUDE.md` and `AGENTS.md`. They live in `$WORKDIR`,
  outside this repo, so they do not apply to work here.

## ai-website-cloner-template (2026-10-05)

[JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)
(MIT) — a Next.js 16 / React 19 / Tailwind v4 / shadcn template whose bundled
`/clone-website <url>` agent command recreates a live site as a clean Next.js
app. Installed by `ai-tools/setup.sh` (and `setup.ps1` where present) into
`~/ai-tools/ai-website-cloner-template`; not vendored here.

- **Install:** clone, drop the `origin` remote, `npm ci`, `npm run typecheck`.
  Verified in a cloud session on 2026-10-05 (v0.6.1): install and typecheck pass.
- **Node:** upstream asks for Node 24+. On Node 22 `npm ci` only warns and
  typecheck passes; use 24 for `next build`/`dev` if anything misbehaves.
- **Run:** `cd ~/ai-tools/ai-website-cloner-template`, start `claude` (with
  browser access), `/clone-website https://example.com`, then `npm run dev`
  → http://localhost:3000.

**Guardrails:** clone sites you own or are licensed to reproduce — for
reference/redesign of our own store, or a layout study. Copying a competitor's
copy, imagery, logos or trade dress and publishing it is infringement, and
Shopify's terms forbid it on a storefront. Output is a Next.js app, not a
Shopify theme: treat it as a first draft and port what you keep, re-adding
validation and accessibility per the Ponytail rules.

## Seven-tool batch (2026-10-19)

All cloned shallow into `~/ai-tools` by `setup.sh` step 5, never vendored
(except Anatomy, which is a Claude skill and lives in `.claude/skills/anatomy/`).

| Tool | What | License | Run |
|---|---|---|---|
| [WordCraft](https://github.com/storytold/wordcraft) | Rust Word clone, reads/writes .docx, alpha | MIT/Apache-2.0 | `cargo run --release -p wordcraft -- --sample`; `wordcraft-cli` converts to PDF |
| [ARTEMIS](https://github.com/google/artemis) (Google) | Natural-language Android automation, MCP server | Apache-2.0 | `uv sync`, then `./start.sh` or `uv run artemis ui` (:8000). Needs a phone/emulator with `adb`; neither is in the cloud container |
| [VoiceStudio](https://github.com/debpalash/VoiceStudio) | Local voice cloning/dubbing/TTS/transcription | **AGPL-3.0** | `bun install && bun run setup:api && bun run dev`. Downloads models, wants a GPU; run on a desktop. Voice cloning only with the speaker's permission |
| [OpenTerminal](https://github.com/ErTasselli/OpenTerminal) | Terminal-style market dashboard on free public data | MIT | `npm install && npm run dev` (web :3000, API :4000). Data is unofficial and may be wrong: not for investment decisions. Optional `ANTHROPIC_API_KEY` |
| [Anatomy](https://github.com/wheresryan22/anatomy) | Claude skill: explains an idea as an interactive isometric SVG | MIT | `/anatomy <idea>`; examples build with `node examples/<name>/build.mjs` |
| [SolidCraft](https://github.com/tangency-labs/solidcraft) | Rust parametric CAD, CLI + MCP server, early | MIT/Apache-2.0 | `cargo run --release -p solidcraft-cli -- commands` |
| [XERJ](https://github.com/xerj-org/xerj) | Local search engine for agents, Elasticsearch-compatible | Apache-2.0 | Upstream: `curl -fsSL https://xerj.org/get \| sh` (blocked by the cloud proxy; build from `engine/` with `cargo build --release -p xerj-server`), then `xerj --insecure --data-dir ./data`, `xerj autoindex <dir>`, `xerj init` for MCP. `--insecure` = no auth, localhost only |

Roadmaps: each repo's `ROADMAP.md` (WordCraft, SolidCraft, XERJ) or README
(ARTEMIS: iOS, on-device vision, voice; OpenTerminal: drawing tools, Greeks,
alerts, Postgres). Pinned at clone time (2026-10-19): WordCraft `117aea3`,
ARTEMIS `351ca84`, VoiceStudio `18bf05a`, OpenTerminal `aed097c`, Anatomy
`1482e84`, SolidCraft `3b4db52`, XERJ `e6216b6`.

### Verified status (2026-10-19, cloud container)

| Tool | Verified | Not verified / blocked |
|---|---|---|
| WordCraft | `wordcraft-cli` built; `.md` -> `.docx` -> `.pdf` and `info` ran | `trunk build --release` of `apps/wordcraft-web` succeeded (output `dist/web`, 43 MB); served over HTTP, the home screen (templates, Recent) rendered in headless Chromium with no console errors | Desktop app and MCP mode not run; editing in the browser not exercised |
| SolidCraft | `solidcraft-cli` built; `examples/bracket.json` -> valid-size `.step` | `trunk build --release --public-url ./` of `apps/solidcraft-web` succeeded (output `dist/web`, 48 MB) | With default headless Chromium (WebGL fallback) the page panics: wgpu `create_render_pipeline 'sc_tris'` cannot do `textureLoad` on depth textures. With WebGPU enabled (`--headless=new --enable-unsafe-webgpu --enable-features=Vulkan --use-angle=swiftshader --use-vulkan=swiftshader --enable-unsafe-swiftshader`) it starts on the BrowserWebGpu backend with no errors or panics, but the headless screenshot stays blank, so rendering is **not confirmed**; open it in a desktop WebGPU browser. Desktop app and MCP mode not run |
| XERJ | `xerj` built; node started on 127.0.0.1 (`--insecure`), `autoindex` of 4 files, `search` returned a lexical hit | `xerj init` (MCP wiring) not run; it edits client config |
| OpenTerminal | `npm run dev`: API `/api/status` ok, web `:3000` returns 200 | No AI assistant (no `ANTHROPIC_API_KEY`); data endpoints not checked |
| ARTEMIS | `uv sync`; web console serves on `:8000` after building the Angular UI | No device: no task run. The UI build needs Node >= 22.22.3 (container has 22.22.0; used `npx node@24 ... ng build`) |
| Anatomy | `node examples/dial-indicator/build.mjs` wrote its HTML | Browser checks and the 3D mode not run |
| VoiceStudio | `bun install`; backend installed from **PyPI torch** (see below); `setup.py` passed; `bun scripts/dev-backend.mjs` boots and `GET :3900/health` returns `{"status":"ok","device":"cpu","version":"0.5.7"}` | No model downloaded: `huggingface.co` is denied, so voice generation, ASR and watermark checkpoints are unavailable and the OmniVoice licence is not accepted. Frontend/Electron app not built or run. Stock `bun run setup:api` still fails (`download-r2.pytorch.org` denied) |

Web builds need `cargo install trunk --locked` (about 7 min) and the `wasm32-unknown-unknown` target; trunk then downloads `wasm-bindgen` and `wasm-opt` itself. Each `trunk build --release` took about 8-10 min.

**VoiceStudio without the PyTorch hosts.** Upstream pins torch to `download.pytorch.org`, which the cloud proxy denies. PyPI is allowed, so:

```bash
cd ~/ai-tools/VoiceStudio
printf 'torch==2.8.0\ntorchaudio==2.8.0\ntorchvision==0.23.0\n' > ../voicestudio-torch-constraints.txt
UV_CONSTRAINT=$PWD/../voicestudio-torch-constraints.txt uv sync --no-sources
uv run --no-sync python scripts/setup.py
UV_NO_SYNC=1 bun scripts/dev-backend.mjs          # API on :3900
```

`--no-sources` ignores upstream's index pins, so this resolves off the lockfile and installs the CUDA-flavoured `+cu128` wheels (about 8 GB in `.venv`) even on a CPU box; it runs on CPU. Always use `--no-sync` afterwards, or uv swaps torch back to the blocked index. On a desktop with the hosts reachable, use `bun run setup:api` instead.

## Trending-tool sweep (2026-10-19): mcpproxy installed; others vetted and left out

Sources: GitHub trending (weekly, daily), a web search for new MCP gateways. Licenses read from each repo page; READMEs read before deciding.

| Repo | License | Decision |
|---|---|---|
| [smart-mcp-proxy/mcpproxy-go](https://github.com/smart-mcp-proxy/mcpproxy-go) | MIT | **Installed** in `~/ai-tools/mcpproxy-go`, binary `~/ai-tools/bin/mcpproxy` (built with `go build ./cmd/mcpproxy`, last upstream commit 2026-10-18). Local MCP gateway: clients see 12 fixed tools (`retrieve_tools`, `describe_tool`, `call_tool_*`, ...) instead of every upstream schema; new upstream servers are quarantined until approved. |
| [mksglu/context-mode](https://github.com/mksglu/context-mode) | **ELv2** (source-available, not open source) | Not installed. Six hooks on every tool call, wipes session data on start, links a hosted dashboard. Needs a deliberate yes. |
| [ruvnet/ruflo](https://github.com/ruvnet/ruflo) | MIT | Not installed. Rewrites `.claude/` hooks and `CLAUDE.md`, registers its own MCP server, unsandboxed mods, `curl \| bash` option, self-reported benchmarks. |
| [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) | MIT | Not installed. Overlaps the Anatomy skill already vendored. |
| `YuJunZhiXue/dsh-purge`, `morluto/rea` | - | Skipped: a self-described jailbreak; a 229k-stars-in-a-week count that does not look organic. |

**mcpproxy state.** Verified: boots, `GET /healthz` ok, MCP `initialize` and `tools/list` over `http://127.0.0.1:8090/mcp` return its 12 tools. Not verified: an upstream server connecting and being approved, and use from a real client. It is **not** wired into `.mcp.json`; that file is a deliberate four-server budget. It has anonymous telemetry on by default: run `mcpproxy telemetry disable` (done for `~/ai-tools/mcpproxy-data`).

```bash
cd ~/ai-tools
bin/mcpproxy telemetry disable -d $PWD/mcpproxy-data -c $PWD/mcpproxy-data/mcp_config.json
bin/mcpproxy serve -c $PWD/mcpproxy-data/mcp_config.json -d $PWD/mcpproxy-data -l 127.0.0.1:8090
```

**What this does not fix.** The MCP servers that fail to connect in cloud sessions are refused by the environment's egress proxy (`403` on the tunnel). A local gateway still has to reach the same hosts, so those need to be allowed in the environment's network settings.

### context-mode: installed MCP-only (2026-10-19)

Added with `claude mcp add --scope local context-mode -- npx -y context-mode@1.0.169` in each repo directory (pinned to the version I read; local scope, so it lives in `~/.claude.json`, is not committed, and is not in `.mcp.json`). `claude mcp list` shows it `Connected`; a stdio probe returned its 11 tools (`ctx_execute`, `ctx_execute_file`, `ctx_index`, `ctx_search`, `ctx_fetch_and_index`, `ctx_batch_execute`, `ctx_stats`, `ctx_doctor`, `ctx_upgrade`, `ctx_purge`, `ctx_insight`). Its tools appear in a session only after a restart.

- **No hooks.** The plugin route (six hooks on every tool call) was blocked as self-modification and not used; MCP-only means it only helps when a tool is called on purpose, with no automatic routing of tool output.
- **License is ELv2**, source-available, free to use, not open source.
- **Where its data lives:** `~/.claude/context-mode/sessions` (session database) and `~/.claude/context-mode/content` (indexed content), both local. Verified 2026-10-19 after indexing this README through `ctx_index`.
- Event forwarding to a remote service is off unless a `platform.json` with an API key exists at `$XDG_CONFIG_HOME/context-mode/` (or `~/.context-mode/` when that variable is unset). Neither exists here. `ctx_upgrade` pulls from GitHub and `ctx_insight` opens a hosted dashboard: avoid both on anything sensitive. `ctx_fetch_and_index` fetches URLs.
- To remove: `claude mcp remove --scope local context-mode`. Re-run the add command after a container reset.

## superdesigndev sweep (2026-10-19): read, cloned for reference, nothing wired in

| Repo | License | Free? | Decision |
|---|---|---|---|
| [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | MIT | Skill yes; needs a `superdesign login` account on the hosted service, pricing not stated | **Vendored** at `.claude/skills/superdesign/` (upstream `f9f05cd`, 2026-08-21) with all 42 CLI calls pinned from `@latest` to `@superdesign/cli@0.14.0` (see its `PINNED.md`). The pinned CLI runs (`--version` prints 0.14.0). Not verified: login, or any call to superdesign.dev (blocked in cloud sessions). It sends codebase context and URLs to superdesign.dev; the CLI's usage tracking is off via `DO_NOT_TRACK=1` in `.claude/settings.json`. |
| [superdesigndev/superdesign](https://github.com/superdesigndev/superdesign) | not named on the page | Yes (says free and open source) | Skipped: a Cursor/VS Code extension, README says it is no longer maintained, and there is no IDE here. |
| [superdesigndev/treg](https://github.com/superdesigndev/treg) | Apache-2.0 **with additional terms** (no competing hosted registry) | Software yes; hosted calls are paid per call, $1 free credit once | Not installed. Needs a treg.to account, `curl \| sh` install, anonymous PostHog usage data (off with `DO_NOT_TRACK=1`), and `treg upload` sends your `.env` keys to their server. |
| [superdesigndev/loopany-platform](https://github.com/superdesigndev/loopany-platform) | MIT | Code yes; hosted pricing not stated | Cloned to `~/ai-tools/loopany-platform` (`df87548`, 2026-08-10), **not run**. Early-stage scheduler whose daemon runs your coding agent with your credentials on a schedule; not something to start unattended. |

`superdesign.dev`, `loopany.ai` and `treg.to` are all refused by the cloud proxy (checked 2026-10-19), so none of the hosted services work from a cloud session anyway.

**To use the Superdesign skill:** run it where `superdesign.dev` is reachable, `npx --yes @superdesign/cli@0.14.0 login` once (browser), then invoke the `superdesign` skill. Do not point it at confidential or customer data. To bump the CLI, change every `@0.14.0` in the skill folder deliberately.

### superdesign-prompts (2026-10-19): vendored text-only into the Superdesign skill

[superdesigndev/superdesign-prompts](https://github.com/superdesigndev/superdesign-prompts) at `6c60906` (2026-08-03). Code MIT, prompt content CC0, free, no account needed to read it. Cloned to `~/ai-tools/superdesign-prompts`; the 140 prompt specs, 16 page-type guides, a generated `INDEX.md`, both licenses and `PROVENANCE.md` are in `.claude/skills/superdesign/prompt-library/` (2.6 MB; the 105 MB of preview images and videos, `prompts.json`/`csv`, and the experimental `systems/` folder were left out). The skill's `SKILL.md` now says to read the local library before calling the hosted `search-prompts`, so this part works offline and without the superdesign.dev login. Scanned for injection-style or command text: none (one code comment mentions "system prompt"). Some samples embed third-party CDN scripts; do not ship them unreviewed. Page-type `SKILL.md` files were renamed `PAGE-TYPE.md` so nothing registers as a nested skill.
