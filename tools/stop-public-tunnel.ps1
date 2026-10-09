$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $gameRoot '.tools\network\public-address.json'
if (Test-Path -LiteralPath $statePath) {
    $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    $process = Get-Process -Id $state.pid -ErrorAction SilentlyContinue
    $expected = Join-Path $gameRoot '.tools\network\cloudflared.exe'
    if ($process -and $process.Path -eq $expected) { Stop-Process -Id $process.Id }
    Remove-Item -LiteralPath $statePath
}
Write-Output '临时公网入口已关闭，局域网游戏服务保留。'
