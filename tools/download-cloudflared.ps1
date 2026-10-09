$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$folder = Join-Path $gameRoot '.tools\network'
New-Item -ItemType Directory -Path $folder -Force | Out-Null
$target = Join-Path $folder 'cloudflared.exe'
Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/download/2026.10.0/cloudflared-windows-amd64.exe' -OutFile $target
$expected = '86aee4017b26625cee8484c113558f48effa4cd47f7aa05fcf425604e5d2b23c'
if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLower() -ne $expected) { throw '官方文件校验失败，请勿运行。' }
& $target --version
