<#
.SYNOPSIS
  Windows PowerShell installer for the ai-tools stack, mirroring ai-tools/setup.sh.
.DESCRIPTION
  Same on-demand pattern as setup.sh: clones OpenManus, screenshot-to-code and
  OpenUI into $WorkDir (default ~/ai-tools), installs their dependencies, and
  renders OpenManus's OpenRouter config from
  ai-tools/openmanus/config.openrouter.toml. Nothing is vendored into this repo
  and nothing here is an application dependency. Safe to re-run: each step is
  independent, and a step whose prerequisites are missing is skipped rather than
  aborting the others.

  NOT VERIFIED ON WINDOWS. setup.sh is the tested path; this is a
  line-for-line port. Report anything that drifts.

  IMPORTANT: config.toml is written with [System.IO.File]::WriteAllText using
  a BOM-less UTF8Encoding. `Set-Content -Encoding utf8` in Windows PowerShell
  5.1 prepends a UTF-8 byte-order mark, which Python's tomllib rejects with
  "Invalid statement (at line 1, column 1)" - a config that looks correct but
  fails to parse. Do not swap this back to Set-Content.
.PARAMETER WorkDir
  Where the tools get installed. Defaults to $HOME\ai-tools.
.PARAMETER Model
  Any OpenRouter model id for OpenManus. Defaults to anthropic/claude-sonnet-4.5.
.PARAMETER SkipBrowser
  Skip installing Browser Use + Chromium for OpenManus.
.PARAMETER Only
  Run just one step: OpenManus, screenshot-to-code, or openui.
#>
param(
  [string]$WorkDir = "$HOME\ai-tools",
  [string]$Model = "anthropic/claude-sonnet-4.5",
  [switch]$SkipBrowser,
  [ValidateSet("OpenManus", "screenshot-to-code", "openui")]
  [string]$Only
)

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:Skipped = @()
$script:Failed = @()

function Have($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# A directory with no .git is the debris of an interrupted clone, not your work,
# so it is discarded rather than left to block every future run.
function Clone-Once($url, $dest) {
  if ((Test-Path $dest) -and -not (Test-Path (Join-Path $dest ".git"))) {
    Write-Host "    discarding partial clone at $dest"
    Remove-Item -Recurse -Force $dest
  }
  if (-not (Test-Path (Join-Path $dest ".git"))) { git clone --depth 1 $url $dest }
}

function Ensure-Uv {
  if (Have uv) { return $true }
  Write-Host "==> installing uv..." -ForegroundColor Cyan
  Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
  $env:PATH = "$HOME\.local\bin;$env:PATH"
  if (Have uv) { return $true }
  Write-Host "    uv installed but not on PATH. Open a new terminal and re-run." -ForegroundColor Yellow
  return $false
}

# ---------------------------------------------------------------- OpenManus --
function Step-OpenManus {
  $miss = @()
  if (-not (Have git)) { $miss += "git(https://git-scm.com/download/win)" }
  if (-not (Ensure-Uv)) { $miss += "uv" }
  if ($miss.Count) { Write-Host "    skipped - missing: $($miss -join ' ')"; $script:Skipped += "OpenManus"; return }

  if (-not $env:OPENROUTER_API_KEY) {
    $sec = Read-Host "Paste your OpenRouter API key (sk-or-..., blank to skip)" -AsSecureString
    $env:OPENROUTER_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
      [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
  }

  $repo = Join-Path $WorkDir "OpenManus"
  Clone-Once "https://github.com/FoundationAgents/OpenManus.git" $repo
  Set-Location $repo

  if (-not (Test-Path ".venv")) {
    Write-Host "==> creating Python 3.12 venv..." -ForegroundColor Cyan
    uv venv --python 3.12
  }
  Write-Host "==> installing dependencies (this is the slow part)..." -ForegroundColor Cyan
  uv pip install -r requirements.txt
  if ($LASTEXITCODE -ne 0) { throw "dependency install failed." }

  $cfg = Join-Path $repo "config\config.toml"
  if ($env:OPENROUTER_API_KEY) {
    Write-Host "==> writing config\config.toml..." -ForegroundColor Cyan
    $k = $env:OPENROUTER_API_KEY
    $toml = @"
[llm]
model = "$Model"
base_url = "https://openrouter.ai/api/v1"
api_key = "$k"
max_tokens = 8192
temperature = 0.0

[llm.vision]
model = "$Model"
base_url = "https://openrouter.ai/api/v1"
api_key = "$k"
max_tokens = 8192
temperature = 0.0

# Required: upstream always builds DaytonaSettings and daytona_api_key is a
# required field, even though the Daytona sandbox is unused.
[daytona]
daytona_api_key = ""

[mcp]
server_reference = "app.mcp.server"

[runflow]
use_data_analysis_agent = false
"@
    # WriteAllText with UTF8Encoding($false) = no BOM. Set-Content -Encoding utf8
    # would add one and break tomllib - see the .DESCRIPTION note above.
    [System.IO.File]::WriteAllText($cfg, $toml, (New-Object System.Text.UTF8Encoding($false)))
  } elseif (-not (Test-Path $cfg)) {
    Copy-Item (Join-Path $RepoDir "openmanus\config.openrouter.toml") $cfg
    Write-Host "    WARNING: no OPENROUTER_API_KEY - replace __OPENROUTER_API_KEY__ in $cfg" -ForegroundColor Yellow
  } else {
    Write-Host "    config\config.toml already exists - left untouched"
  }

  if (-not $SkipBrowser) {
    Write-Host "==> installing Browser Use + Chromium..." -ForegroundColor Cyan
    uvx browser-use install
  }

  Write-Host "==> boot check..." -ForegroundColor Cyan
  $env:OPENMANUS_DISABLE_BROWSER_USE = "1"
  & ".\.venv\Scripts\python.exe" -c "from app.config import config; print('    config OK ->', config.llm['default'].model)"
  Remove-Item Env:\OPENMANUS_DISABLE_BROWSER_USE
  if ($LASTEXITCODE -ne 0) { throw "boot check failed - config did not load." }
}

# -------------------------------------------------------- screenshot-to-code --
# FastAPI backend on :7001 (poetry) + React/Vite frontend on :5173 (pnpm).
function Step-ScreenshotToCode {
  $miss = @()
  if (-not (Have git))    { $miss += "git(https://git-scm.com/download/win)" }
  if (-not (Have poetry)) { $miss += "poetry(pip install --upgrade poetry)" }
  if (-not (Have pnpm))   { $miss += "pnpm(corepack enable pnpm)" }
  if ($miss.Count) { Write-Host "    skipped - missing: $($miss -join ' ')"; $script:Skipped += "screenshot-to-code"; return }

  $repo = Join-Path $WorkDir "screenshot-to-code"
  Clone-Once "https://github.com/abi/screenshot-to-code.git" $repo

  Set-Location (Join-Path $repo "backend")
  poetry install --no-interaction
  if ($LASTEXITCODE -ne 0) { throw "poetry install failed." }

  # Render backend\.env from whatever keys are in the environment. Only the ones
  # actually set are written, so a re-run with a narrower environment does not
  # silently blank out keys you added by hand.
  $names = @("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "REPLICATE_API_KEY")
  $lines = foreach ($n in $names) {
    $v = [Environment]::GetEnvironmentVariable($n)
    if ($v) { "$n=$v" }
  }
  $envPath = Join-Path $repo "backend\.env"
  if ($lines) {
    [System.IO.File]::WriteAllText($envPath, (($lines -join "`n") + "`n"), (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "    backend\.env written with: $(($lines | ForEach-Object { $_.Split('=')[0] }) -join ' ')"
  } elseif (-not (Test-Path $envPath)) {
    [System.IO.File]::WriteAllText($envPath, "", (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "    WARNING: no model key in the environment. The backend still boots;" -ForegroundColor Yellow
    Write-Host "             set one in $envPath or via the app's settings dialog." -ForegroundColor Yellow
  } else {
    Write-Host "    backend\.env already exists - left untouched"
  }

  # Optional: headless Chromium lets the agent screenshot and check its own
  # output. Missing Chromium only disables that one tool, so never fatal.
  poetry run playwright install chromium 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "    note: playwright chromium not installed - screenshot preview stays off" }

  Set-Location (Join-Path $repo "frontend")
  pnpm install
  if ($LASTEXITCODE -ne 0) { throw "pnpm install failed." }
}

# -------------------------------------------------------------------- OpenUI --
# Single Python service on :7878 that also serves its prebuilt frontend, so
# there is no separate frontend build step. Keys are read from the environment
# at *run* time, not install time - nothing secret is written to disk here.
function Step-OpenUI {
  $miss = @()
  if (-not (Have git)) { $miss += "git(https://git-scm.com/download/win)" }
  if (-not (Ensure-Uv)) { $miss += "uv" }
  if ($miss.Count) { Write-Host "    skipped - missing: $($miss -join ' ')"; $script:Skipped += "openui"; return }

  $repo = Join-Path $WorkDir "openui"
  Clone-Once "https://github.com/wandb/openui.git" $repo
  Set-Location (Join-Path $repo "backend")
  # --frozen: install exactly the locked versions. --extra litellm: adds the
  # LiteLLM proxy so Gemini/Mistral/Cohere/local endpoints work, not just
  # OpenAI/Anthropic/Groq. uv provisions its own interpreter if needed.
  uv sync --frozen --extra litellm
  if ($LASTEXITCODE -ne 0) { throw "uv sync failed." }
  if (-not (Test-Path "openui\dist")) { throw "prebuilt frontend (backend\openui\dist) missing." }
  & ".\.venv\Scripts\python.exe" -c "import openui.server; print('    server imports OK')"
  if ($LASTEXITCODE -ne 0) { throw "server import failed." }
}

function Run-Step($label, $name, $fn) {
  if ($Only -and $Only -ne $name) { return }
  Write-Host "==> $label" -ForegroundColor Cyan
  try { & $fn }
  catch {
    Write-Host "    FAILED: $name - $($_.Exception.Message)" -ForegroundColor Red
    $script:Failed += $name
  }
}

New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null
Run-Step "1/3 OpenManus"          "OpenManus"          ${function:Step-OpenManus}
Run-Step "2/3 screenshot-to-code" "screenshot-to-code" ${function:Step-ScreenshotToCode}
Run-Step "3/3 OpenUI"             "openui"             ${function:Step-OpenUI}

Write-Host ""
Write-Host "------------------------------------------------------------------"
Write-Host "OpenManus - headless agent (no port; CLI)"
Write-Host "  cd `"$WorkDir\OpenManus`"; .\.venv\Scripts\python.exe main.py --prompt `"your task`""
Write-Host ""
Write-Host "screenshot-to-code - two processes, open http://localhost:5173"
Write-Host "  cd `"$WorkDir\screenshot-to-code\backend`"; poetry run uvicorn main:app --port 7001"
Write-Host "  cd `"$WorkDir\screenshot-to-code\frontend`"; pnpm dev"
Write-Host ""
Write-Host "OpenUI - one process, open http://localhost:7878"
Write-Host "  cd `"$WorkDir\openui\backend`"; .\.venv\Scripts\python.exe -m openui"
Write-Host ""
Write-Host "Both UI tools need a vision-capable model key to generate anything."
Write-Host "See ai-tools\README.md and .env.example."
Write-Host "------------------------------------------------------------------"

if ($script:Skipped.Count) { Write-Host "Skipped (missing prerequisites): $($script:Skipped -join ' ')" -ForegroundColor Yellow }
if ($script:Failed.Count) {
  Write-Host "Failed: $($script:Failed -join ' ') - re-run after fixing; completed steps are picked up in place." -ForegroundColor Red
  exit 1
}
Write-Host "Done." -ForegroundColor Green
Write-Host "Cost: OpenManus runs are autonomous loops of up to 20 LLM calls, and each" -ForegroundColor Yellow
Write-Host "screenshot-to-code / OpenUI generation is a vision call. Check spend early." -ForegroundColor Yellow
