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

```bash
export OPENROUTER_API_KEY="sk-or-..."   # never commit this
./ai-tools/setup.sh                     # clones to ~/ai-tools/OpenManus
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

**Credentials:** `OPENROUTER_API_KEY` only (see `.env.example`), read from your
environment at setup time. The rendered `config/config.toml` lives in
`~/ai-tools/OpenManus`, outside this repo — keep it that way; it holds the key
in plaintext.

**Cost warning:** an OpenManus run is an autonomous loop, up to 20 steps by
default (`max_steps`), each a full LLM call with the tool results in context. A
single browsing task can cost real money on a frontier model. Start with a
cheap model and a narrow prompt, and check your OpenRouter spend after the
first few runs before scheduling anything recurring.
