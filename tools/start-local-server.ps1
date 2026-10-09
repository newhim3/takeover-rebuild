param([switch]$NoBrowser, [switch]$Lan, [switch]$Restart)
$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$gameAddress = 'http://127.0.0.1:4387/'
$gameIndexText = [System.IO.File]::ReadAllText((Join-Path $gameRoot 'index.html'))
$gameBuildTag = [regex]::Match($gameIndexText, '<meta\b[^>]*\bname\s*=\s*["'']game-build["''][^>]*>', 'IgnoreCase')
$gameBuildMatch = [regex]::Match($gameBuildTag.Value, '\bcontent\s*=\s*["'']([a-f0-9]{16})["'']', 'IgnoreCase')
if (-not $gameBuildMatch.Success) { throw '本目录的 index.html 缺少有效构建标识，请保留完整游戏文件。' }
$gameExpectedBuild = $gameBuildMatch.Groups[1].Value.ToLowerInvariant()
$gameBundledNode = Join-Path $gameRoot '.tools\native\node.exe'
$gameNodeCommand = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue
$gameNodePath = if (Test-Path -LiteralPath $gameBundledNode) { $gameBundledNode } elseif ($gameNodeCommand) { $gameNodeCommand.Source } else {
    throw '没有找到 Node.js。请安装 Node.js 24 或更新版本并加入 PATH，或先运行 tools/build-release.ps1。'
}
if (-not (Test-Path -LiteralPath $gameNodePath)) { throw '没有找到 Node.js，无法启动联机服务。' }
$gameNodePath = [System.IO.Path]::GetFullPath($gameNodePath)
$gameServerPath = [System.IO.Path]::GetFullPath((Join-Path $gameRoot 'server.cjs'))
$gameNativeDirectory = Join-Path $gameRoot '.tools\native'
function Test-GameAbsolutePath($ActualPath, $ExpectedPath) {
    try {
        return [System.IO.Path]::IsPathRooted($ActualPath) -and [string]::Equals([System.IO.Path]::GetFullPath($ActualPath), [System.IO.Path]::GetFullPath($ExpectedPath), [StringComparison]::OrdinalIgnoreCase)
    } catch { return $false }
}
function Stop-ManagedGameServer {
    $gameStateFile = Join-Path $gameNativeDirectory 'launcher-server-state.json'
    try {
        if (-not (Test-Path -LiteralPath $gameStateFile)) { return $false }
        $gameManagedState = Get-Content -LiteralPath $gameStateFile -Raw | ConvertFrom-Json
        if (-not $gameManagedState.createdUtc -or -not $gameManagedState.pid -or -not (Test-GameAbsolutePath $gameManagedState.nodePath $gameNodePath) -or -not (Test-GameAbsolutePath $gameManagedState.serverPath $gameServerPath)) { return $false }
        $gameManagedCreated = if ($gameManagedState.createdUtc -is [DateTime]) { $gameManagedState.createdUtc.ToUniversalTime() } else { [DateTimeOffset]::Parse($gameManagedState.createdUtc, [Globalization.CultureInfo]::InvariantCulture).UtcDateTime }
        $gameManagedProcess = Get-Process -Id $gameManagedState.pid -ErrorAction Stop
        if ($gameManagedProcess.HasExited -or [math]::Abs(($gameManagedProcess.StartTime.ToUniversalTime() - $gameManagedCreated).TotalSeconds) -gt 1) { return $false }
        $gameActualIdentity = Get-CimInstance Win32_Process -Filter ('ProcessId = {0}' -f [int]$gameManagedState.pid) -ErrorAction Stop
        $gameNodePattern = [regex]::Escape($gameNodePath)
        $gameServerPattern = [regex]::Escape($gameServerPath)
        $gameCommandPattern = '^\s*(?:"' + $gameNodePattern + '"|' + $gameNodePattern + ')\s+"' + $gameServerPattern + '"\s*$'
        if (-not (Test-GameAbsolutePath $gameActualIdentity.ExecutablePath $gameNodePath) -or -not [regex]::IsMatch($gameActualIdentity.CommandLine, $gameCommandPattern, 'IgnoreCase')) { return $false }
        $gameManagedProcess.Refresh()
        if ($gameManagedProcess.HasExited -or [math]::Abs(($gameManagedProcess.StartTime.ToUniversalTime() - $gameManagedCreated).TotalSeconds) -gt 1) { return $false }
        Stop-Process -InputObject $gameManagedProcess -ErrorAction Stop
        if (-not $gameManagedProcess.WaitForExit(3000)) { throw '托管服务未及时停止，请稍后重试。' }
        $gameRestartNotice = '本地游戏服务已更新或手动重启，原有房间已结束，请重新创建房间。'
        $gameRestartNotice | Set-Content -LiteralPath (Join-Path $gameNativeDirectory 'restart-notice.txt') -Encoding UTF8
        ('{0} 核验后停止托管服务 PID {1}；{2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $gameManagedState.pid, $gameRestartNotice) | Add-Content -LiteralPath (Join-Path $gameNativeDirectory 'launcher.log') -Encoding UTF8
        return $true
    } catch {
        Write-Warning ('未重启服务：' + $_.Exception.Message)
        return $false
    }
}
function Test-GameServer([switch]$RequireLan) {
    try {
        $gameProbeRoute = if ($RequireLan) { 'api/lan/peers' } else { 'api/network' }
        $gameProbe = Invoke-RestMethod -Uri ($gameAddress + $gameProbeRoute) -TimeoutSec 1
        return $(if ($RequireLan) { $gameProbe.lanProtocol -eq 1 -and $gameProbe.self.build -ceq $gameExpectedBuild } else { $null -ne $gameProbe.addresses })
    } catch { return $false }
}
if ($Restart -or ($Lan -and (Test-GameServer) -and -not (Test-GameServer -RequireLan))) {
    if (-not (Stop-ManagedGameServer) -and (Test-GameServer)) {
        throw '4387 端口的服务与本目录版本不符，且无法核验为本启动器托管的进程。请关闭原目录中的游戏服务后重试；启动器不会关闭其它程序。'
    }
}
if (-not (Test-GameServer -RequireLan:$Lan)) {
    New-Item -ItemType Directory -Path $gameNativeDirectory -Force | Out-Null
    $gameLogTag = '{0}-{1}' -f (Get-Date -Format 'yyyyMMdd-HHmmss-fff'), $PID
    $gameServerProcess = Start-Process -FilePath $gameNodePath -ArgumentList ('"' + $gameServerPath + '"') -WorkingDirectory $gameRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $gameNativeDirectory ("server-$gameLogTag-output.log")) -RedirectStandardError (Join-Path $gameNativeDirectory ("server-$gameLogTag-error.log"))
    $gameServerReady = $false
    for ($gameAttempt = 0; $gameAttempt -lt 30; $gameAttempt++) {
        Start-Sleep -Milliseconds 150
        if (Test-GameServer -RequireLan:$Lan) { $gameServerReady = $true; break }
        if ($gameServerProcess.HasExited) { break }
    }
    if (-not $gameServerReady) { throw "游戏服务没有启动。请检查 4387 端口是否被旧游戏服务占用；启动日志位于 .tools/native/server-$gameLogTag-*.log。" }
    if (-not $gameServerProcess.HasExited) {
        $gameServerState = [ordered]@{ pid = $gameServerProcess.Id; createdUtc = $gameServerProcess.StartTime.ToUniversalTime().ToString('o'); nodePath = $gameNodePath; serverPath = (Join-Path $gameRoot 'server.cjs') }
        $gameServerState | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $gameNativeDirectory 'launcher-server-state.json') -Encoding UTF8
        $gameServerProcess.Id | Set-Content -LiteralPath (Join-Path $gameNativeDirectory 'launcher-server.pid') -Encoding ASCII
    }
}
if (-not $NoBrowser) {
    $gameEntryAddress = $gameAddress + $(if ($Lan) { '?online=1' } else { '' })
    Start-Process $gameEntryAddress -WindowStyle Hidden
}
