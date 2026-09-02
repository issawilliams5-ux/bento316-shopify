<#
.SYNOPSIS
  Windows PowerShell installer for OpenManus, mirroring ai-tools/setup.sh.
.DESCRIPTION
  Same on-demand pattern as setup.sh: clones OpenManus into $WorkDir (default
  ~/ai-tools), builds a uv venv, installs deps, and renders an OpenRouter
  config from ai-tools/openmanus/config.openrouter.toml. Never vendored into
  this repo. Safe to re-run.

  IMPORTANT: config.toml is written with [System.IO.File]::WriteAllText using
  a BOM-less UTF8Encoding. `Set-Content -Encoding utf8` in Windows PowerShell
  5.1 prepends a UTF-8 byte-order mark, which Python's tomllib rejects with
  "Invalid statement (at line 1, column 1)" - a config that looks correct but
  fails to parse. Do not swap this back to Set-Content.
.PARAMETER WorkDir
  Where OpenManus gets installed. Defaults to $HOME\ai-tools.
.PARAMETER Model
  Any OpenRouter model id. Defaults to anthropic/claude-sonnet-4.5.
.PARAMETER SkipBrowser
  Skip installing Browser Use + Chromium.
#>
param(
  [string]$WorkDir = "$HOME\ai-tools",
  [string]$Model = "anthropic/claude-sonnet-4.5",
  [switch]$SkipBrowser
)

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path

try {
  if (-not $env:OPENROUTER_API_KEY) {
    $sec = Read-Host "Paste your OpenRouter API key (sk-or-...)" -AsSecureString
    $env:OPENROUTER_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
      [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
  }
  if (-not $env:OPENROUTER_API_KEY) { throw "No API key given." }

  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "git is not installed. Get it from https://git-scm.com/download/win then re-run."
  }
  if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "==> installing uv..." -ForegroundColor Cyan
    Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
    $env:PATH = "$HOME\.local\bin;$env:PATH"
  }
  if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    throw "uv installed but not on PATH. Open a new terminal and re-run this script."
  }

  New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null
  $repo = Join-Path $WorkDir "OpenManus"
  if (Test-Path (Join-Path $repo ".git")) {
    Write-Host "==> updating existing clone..." -ForegroundColor Cyan
    git -C $repo pull --ff-only 2>&1 | Out-Null
  } else {
    Write-Host "==> cloning OpenManus..." -ForegroundColor Cyan
    git clone --depth 1 https://github.com/FoundationAgents/OpenManus.git $repo
  }
  Set-Location $repo

  if (-not (Test-Path ".venv")) {
    Write-Host "==> creating Python 3.12 venv..." -ForegroundColor Cyan
    uv venv --python 3.12
  }
  Write-Host "==> installing dependencies (this is the slow part)..." -ForegroundColor Cyan
  uv pip install -r requirements.txt
  if ($LASTEXITCODE -ne 0) { throw "dependency install failed." }

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
  [System.IO.File]::WriteAllText("$repo\config\config.toml", $toml, (New-Object System.Text.UTF8Encoding($false)))

  if (-not $SkipBrowser) {
    Write-Host "==> installing Browser Use + Chromium..." -ForegroundColor Cyan
    uvx browser-use install
  }

  Write-Host "==> boot check..." -ForegroundColor Cyan
  $env:OPENMANUS_DISABLE_BROWSER_USE = "1"
  & ".\.venv\Scripts\python.exe" -c "from app.config import config; print('config OK ->', config.llm['default'].model)"
  Remove-Item Env:\OPENMANUS_DISABLE_BROWSER_USE
  if ($LASTEXITCODE -ne 0) { throw "boot check failed - config did not load." }

  Write-Host ""
  Write-Host "DONE. Installed at $repo" -ForegroundColor Green
  Write-Host ""
  Write-Host "Run a task:"
  Write-Host "  cd `"$repo`""
  Write-Host "  .\.venv\Scripts\python.exe main.py --prompt `"your task here`""
  Write-Host ""
  Write-Host "Options:"
  Write-Host "  Skip browser tools:   .\ai-tools\setup.ps1 -SkipBrowser"
  Write-Host "  Cheaper model:        .\ai-tools\setup.ps1 -Model 'deepseek/deepseek-chat'"
  Write-Host "                        (or edit [llm] model in $repo\config\config.toml directly)"
  Write-Host "  Re-run anytime - it updates the existing clone in place."
  Write-Host ""
  Write-Host "Cost: each run is an autonomous loop of up to 20 LLM calls with growing" -ForegroundColor Yellow
  Write-Host "context. Start narrow and check your OpenRouter spend before repeating." -ForegroundColor Yellow
}
catch {
  Write-Host ""
  Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Fix the above and re-run - it picks up where it left off." -ForegroundColor Red
  exit 1
}
