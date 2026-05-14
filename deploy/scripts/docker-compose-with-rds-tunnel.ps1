#Requires -Version 5.1
<#
.SYNOPSIS
  Starts an SSH local port forward to RDS via bastion, then runs docker compose.

.DESCRIPTION
  For commands that need DB connectivity (e.g. "up", "up -d"), the script starts an SSH
  port forward in the background, waits for 127.0.0.1:<localPort> to accept connections,
  then runs docker compose. The SSH process is stopped on exit.

  For commands that do not need DB connectivity (e.g. build/down/config), the tunnel is skipped.

.PARAMETER ComposeArgs
  Arguments passed to docker compose after -f and --env-file (e.g. up, up -d, build, down).

.EXAMPLE
  .\docker-compose-with-rds-tunnel.ps1 up -d
  .\docker-compose-with-rds-tunnel.ps1 build
#>
param(
  [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
  [string[]] $ComposeArgs = @("up")
)

$ErrorActionPreference = "Stop"

$DeployRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ComposeFile = Join-Path $DeployRoot "docker-compose.local.yml"
$EnvFile = Join-Path $DeployRoot ".env.local"
$TunnelEnvPath = Join-Path $PSScriptRoot "rds-tunnel.env"

function Import-DotEnvFile {
  param([string] $Path)
  if (-not (Test-Path -LiteralPath $Path)) { return }
  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }
    $name = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()
    if ($value.StartsWith('"') -and $value.EndsWith('"')) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    Set-Item -Path "Env:$name" -Value $value
  }
}

Import-DotEnvFile -Path $TunnelEnvPath

$firstArg = if ($ComposeArgs.Count -gt 0) { $ComposeArgs[0] } else { "" }
$skipTunnel = $firstArg -in @("down", "build", "config", "version", "images")

$sshKey = $env:ITING_SSH_KEY
$sshUser = if ($env:ITING_SSH_USER) { $env:ITING_SSH_USER } else { "ubuntu" }
$bastion = $env:ITING_BASTION_HOST
$rdsIp = $env:ITING_RDS_PRIVATE_IP
$rdsPort = if ($env:ITING_RDS_PORT) { $env:ITING_RDS_PORT } else { "5432" }
$localPort = if ($env:ITING_LOCAL_TUNNEL_PORT) { $env:ITING_LOCAL_TUNNEL_PORT } else { "15432" }

if (-not (Test-Path -LiteralPath $ComposeFile)) { Write-Error "Missing: $ComposeFile" }
if (-not (Test-Path -LiteralPath $EnvFile)) { Write-Error "Missing: $EnvFile (create from .env.local.example)" }

if (-not $skipTunnel) {
  if (-not $sshKey -or -not $bastion -or -not $rdsIp) {
    Write-Error "Missing tunnel config. Copy deploy/scripts/rds-tunnel.env.example to rds-tunnel.env (gitignored) or set ITING_SSH_KEY, ITING_BASTION_HOST, ITING_RDS_PRIVATE_IP."
  }
  if (-not (Test-Path -LiteralPath $sshKey)) {
    Write-Error "SSH key not found: $sshKey"
  }
}

$sshProcess = $null
$startedTunnelHere = $false

function Test-LocalPortOpen {
  param([int] $Port)
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("127.0.0.1", $Port)
    $tcp.Close()
    return $true
  }
  catch {
    return $false
  }
}

try {
  if ($skipTunnel) {
    Write-Host "[tunnel] Skip (docker compose $firstArg does not require DB)."
  }
  elseif (Test-LocalPortOpen -Port ([int]$localPort)) {
    Write-Host "[tunnel] Port $localPort is already accepting connections; reuse existing tunnel."
  }
  else {
    $forward = "${localPort}:${rdsIp}:${rdsPort}"
    $remote = "${sshUser}@${bastion}"
    Write-Host "[tunnel] ssh -i <key> -N -L $forward $remote"

    $sshProcess = Start-Process -FilePath "ssh" `
      -ArgumentList @(
        "-i", $sshKey,
        "-N",
        "-o", "ServerAliveInterval=60",
        "-o", "ExitOnForwardFailure=yes",
        "-L", $forward,
        $remote
      ) `
      -WindowStyle Hidden -PassThru

    $startedTunnelHere = $true

    $deadline = (Get-Date).AddSeconds(30)
    while ((Get-Date) -lt $deadline) {
      if ($sshProcess.HasExited) {
        Write-Error ("SSH tunnel exited early (exit {0}). Check key, bastion SG for your IP, and RDS IP/port." -f $sshProcess.ExitCode)
      }
      if (Test-LocalPortOpen -Port ([int]$localPort)) { break }
      Start-Sleep -Milliseconds 400
    }

    if (-not (Test-LocalPortOpen -Port ([int]$localPort))) {
      Write-Error "Tunnel did not open on 127.0.0.1:$localPort within 30 seconds."
    }

    Write-Host "[tunnel] Listening on 127.0.0.1:$localPort"
  }

  Set-Location $DeployRoot
  $dcArgs = @("-f", $ComposeFile, "--env-file", $EnvFile) + $ComposeArgs
  Write-Host ("[compose] docker compose {0}" -f ($dcArgs -join " "))
  & docker compose @dcArgs
  $composeExit = $LASTEXITCODE
}
finally {
  if (-not $skipTunnel -and $startedTunnelHere -and $sshProcess -and -not $sshProcess.HasExited) {
    Write-Host ("[tunnel] Stopping SSH (PID {0})..." -f $sshProcess.Id)
    Stop-Process -Id $sshProcess.Id -Force -ErrorAction SilentlyContinue
  }
}

if ($null -ne $composeExit) { exit $composeExit }
