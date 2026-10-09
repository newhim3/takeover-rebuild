param([switch]$NoBrowser, [switch]$Restart)
$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$networkFolder = Join-Path $gameRoot '.tools\network'
$tunnelPath = Join-Path $networkFolder 'cloudflared.exe'
if (-not (Test-Path -LiteralPath $tunnelPath)) { throw '请先运行 tools/download-cloudflared.ps1 安装官方隧道程序。' }
& (Join-Path $PSScriptRoot 'start-local-server.ps1') -NoBrowser
$statePath = Join-Path $networkFolder 'public-address.json'
if (Test-Path -LiteralPath $statePath) {
    $existing = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    $running = Get-Process -Id $existing.pid -ErrorAction SilentlyContinue
    if ($running -and $running.Path -eq $tunnelPath) {
        $publicReady = $false
        if (-not $Restart -and $existing.address -match '^https://[a-z0-9-]+\.trycloudflare\.com$') {
            try {
                $publicProbe = Invoke-RestMethod -Uri ($existing.address + '/api/network') -TimeoutSec 6
                $publicReady = $null -ne $publicProbe.addresses
            } catch { $publicReady = $false }
        }
        if ($publicReady) { if (-not $NoBrowser) { Start-Process $existing.address }; Write-Output $existing.address; exit }
        # An alive helper may be retrying a tunnel already deleted by Cloudflare.
        Stop-Process -Id $running.Id
    }
}
$logOut = Join-Path $networkFolder 'tunnel-output.log'
$logErr = Join-Path $networkFolder 'tunnel-error.log'
$tunnel = Start-Process -FilePath $tunnelPath -ArgumentList @('tunnel','--url','http://127.0.0.1:4387','--no-autoupdate','--protocol','http2') -WorkingDirectory $gameRoot -WindowStyle Hidden -RedirectStandardOutput $logOut -RedirectStandardError $logErr -PassThru
for ($attempt = 0; $attempt -lt 90; $attempt++) {
    Start-Sleep -Milliseconds 500
    $logs = (Get-Content -LiteralPath $logOut -Raw -ErrorAction SilentlyContinue) + (Get-Content -LiteralPath $logErr -Raw -ErrorAction SilentlyContinue)
    if ($logs -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
        $address = $Matches[0]
        @{address=$address;pid=$tunnel.Id;created=(Get-Date).ToUniversalTime().ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding utf8
        Write-Output $address
        if (-not $NoBrowser) { Start-Process ($address + '/?online=1') }
        exit
    }
    if ($tunnel.HasExited) { throw ('公网入口启动失败，详见 ' + $logErr) }
}
throw ('入口仍未返回地址，进程仍在尝试连接。详见 ' + $logErr)
