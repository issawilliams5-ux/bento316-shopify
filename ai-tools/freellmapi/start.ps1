# Start the FreeLLMAPI gateway in the background (localhost only by default).
$ErrorActionPreference = 'Stop'
$D = Join-Path $HOME 'ai-tools\freellmapi'
$PidFile = Join-Path $D 'freellmapi.pid'
$EnvFile = Join-Path $D '.env'
if (-not (Test-Path $EnvFile)) { Write-Error "Missing $EnvFile - run ai-tools\setup.ps1 first."; exit 1 }
if (Test-Path $PidFile) {
  if (Get-Process -Id ([int](Get-Content $PidFile)) -ErrorAction SilentlyContinue) {
    Write-Error "Already running (pid $(Get-Content $PidFile)). Stop it first."; exit 1
  }
}
$userHost = $env:HOST; $userPort = $env:PORT
foreach ($line in Get-Content $EnvFile) {
  if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim().Trim('"').Trim("'"), 'Process')
  }
}
$env:HOST = if ($userHost) { $userHost } else { '127.0.0.1' }
if ($userPort) { $env:PORT = $userPort }
$env:NODE_ENV = 'production'
$log = Join-Path $D 'freellmapi.log'
$p = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','start','-w','server' -WorkingDirectory $D `
  -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError "$log.err" -PassThru
$p.Id | Set-Content $PidFile
$port = if ($env:PORT) { $env:PORT } else { '3001' }
Write-Host "Started (pid $($p.Id)) on http://$($env:HOST):$port - log: $log"
