param([switch]$Remove)
$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$gameRuleNames = @('Takeover-LAN-HTTP-4387', 'Takeover-LAN-Discovery-44987')
$gameIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$gamePrincipal = New-Object Security.Principal.WindowsPrincipal($gameIdentity)
if (-not $gamePrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw '请右键“启用局域网联机防火墙.cmd”，选择“以管理员身份运行”。移除规则也需要管理员权限。'
}
if ($Remove) {
    foreach ($gameRuleName in $gameRuleNames) {
        Get-NetFirewallRule -Name $gameRuleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule
    }
    Write-Host '已移除城邦征战的两条局域网防火墙规则。'
    exit
}
$gameBundledNode = Join-Path $gameRoot '.tools\native\node.exe'
$gameNodeCommand = Get-Command node -ErrorAction SilentlyContinue
$gameNodePath = if (Test-Path -LiteralPath $gameBundledNode) { $gameBundledNode } elseif ($gameNodeCommand) { $gameNodeCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $gameNodePath -PathType Leaf)) { throw '没有找到本游戏启动器使用的 Node.js，请保留完整游戏目录。' }
$gameNodePath = (Resolve-Path -LiteralPath $gameNodePath).Path
Write-Host "游戏程序：$gameNodePath"
Write-Host '仅允许专用网络/域网络中的同一子网设备连接 TCP 4387 和 UDP 44987；不会开放公用网络。'
foreach ($gameRuleName in $gameRuleNames) {
    Get-NetFirewallRule -Name $gameRuleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule
}
New-NetFirewallRule -Name $gameRuleNames[0] -DisplayName '城邦征战 · 局域网对局' -Description '仅同一子网的专用/域网络；本地游戏 HTTP、WebSocket 和房间中继。' -Direction Inbound -Action Allow -Program $gameNodePath -Protocol TCP -LocalPort 4387 -Profile Private,Domain -RemoteAddress LocalSubnet | Out-Null
New-NetFirewallRule -Name $gameRuleNames[1] -DisplayName '城邦征战 · 局域网发现' -Description '仅同一子网的专用/域网络；自动发现游戏主机。' -Direction Inbound -Action Allow -Program $gameNodePath -Protocol UDP -LocalPort 44987 -Profile Private,Domain -RemoteAddress LocalSubnet | Out-Null
Write-Host '已启用。各电脑重新打开局域网联机入口，即可在大厅发现房间。'
Write-Host '若游戏目录移动，请重新运行本脚本，使规则匹配新的程序路径。'
Write-Host '撤销方式：移除局域网联机防火墙.cmd。'
