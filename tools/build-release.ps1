param()
$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$gameNative = Join-Path $gameRoot '.tools\native'
$gameBundledNode = Join-Path $gameNative 'node.exe'
$gameNodeCommand = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue
$gameNode = if (Test-Path -LiteralPath $gameBundledNode -PathType Leaf) { $gameBundledNode } elseif ($gameNodeCommand) { $gameNodeCommand.Source } else { throw '需要 Node.js 24 或更新版本。请安装 Node.js 并加入 PATH，或放置 .tools/native/node.exe。' }
$gameNodeVersion = & $gameNode -p 'process.versions.node'
if ($LASTEXITCODE -ne 0 -or [version]$gameNodeVersion -lt [version]'24.0.0') { throw '发布构建需要可运行的 Node.js 24 或更新版本。' }
$gameCompilerCandidates = @(
    (Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'),
    (Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe')
)
$gameCompiler = $gameCompilerCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if (-not $gameCompiler) { throw '没有找到 C# 编译器。此发布构建需要 Windows 和 .NET Framework 4.6 或更新版本，建议安装 4.8。' }
try { $gameFrameworkRelease = [int](Get-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full' -Name Release -ErrorAction Stop).Release } catch { throw '无法确认 .NET Framework 版本。请安装 .NET Framework 4.6 或更新版本，建议安装 4.8。' }
if ($gameFrameworkRelease -lt 393295) { throw '单文件启动器的 AppContext 长路径开关需要 .NET Framework 4.6 或更新版本，建议安装 4.8。' }
foreach ($gameRequired in @('delivery-manifest.json','config/runtime-assets.json','tools/local-launcher.cs','tools/single-file-launcher.cs')) {
    if (-not (Test-Path -LiteralPath (Join-Path $gameRoot $gameRequired) -PathType Leaf)) { throw ('缺少发布输入：' + $gameRequired) }
}
[System.IO.Directory]::CreateDirectory($gameNative) | Out-Null
if (-not (Test-Path -LiteralPath $gameBundledNode -PathType Leaf)) {
    Copy-Item -LiteralPath $gameNode -Destination $gameBundledNode
    $gameNode = $gameBundledNode
}
function Invoke-GameNode([string[]]$GameArguments) {
    & $gameNode @GameArguments
    if ($LASTEXITCODE -ne 0) { throw ('Node 构建失败：' + ($GameArguments -join ' ')) }
}
function Build-GameNative([string]$GameSource, [string]$GameOutput, [string[]]$GameReferences, [string[]]$GameDefines = @()) {
    $gameTemporary = Join-Path $gameNative (([System.IO.Path]::GetFileNameWithoutExtension($GameOutput)) + '.building.exe')
    $gameArguments = @('/nologo','/target:winexe','/optimize+','/platform:anycpu','/codepage:65001',('/out:' + $gameTemporary))
    foreach ($gameReference in $GameReferences) { $gameArguments += '/reference:' + $gameReference }
    foreach ($gameDefine in $GameDefines) { $gameArguments += '/define:' + $gameDefine }
    $gameArguments += Join-Path $gameRoot $GameSource
    & $gameCompiler @gameArguments
    if ($LASTEXITCODE -ne 0) { throw ('C# 编译失败：' + $GameSource) }
    Move-Item -LiteralPath $gameTemporary -Destination (Join-Path $gameRoot $GameOutput) -Force
}
Push-Location $gameRoot
try {
    Write-Output '重建脚本与样式交付文件…'
    Invoke-GameNode -GameArguments @('delivery-build.cjs')
    Write-Output '编译游戏、局域网及单文件启动器…'
    $gameInnerReferences = @('System.Windows.Forms.dll','System.Web.Extensions.dll','System.Management.dll')
    Build-GameNative 'tools/local-launcher.cs' '城邦征战.exe' $gameInnerReferences
    Build-GameNative 'tools/local-launcher.cs' '局域网联机.exe' $gameInnerReferences @('LAN_ENTRY')
    Build-GameNative 'tools/single-file-launcher.cs' '.tools/native/single-file-stub.exe' @('System.Windows.Forms.dll','System.Web.Extensions.dll','System.IO.Compression.dll','System.IO.Compression.FileSystem.dll')
    Write-Output '验证版本化素材清单并生成文件校验清单…'
    Invoke-GameNode -GameArguments @('tools/build-lan-package.cjs','--runtime-only')
    Write-Output '构建便携 ZIP…'
    & (Join-Path $PSScriptRoot 'build-lan-package.ps1')
    Write-Output '构建单文件 EXE…'
    Invoke-GameNode -GameArguments @('tools/build-single-exe.cjs')
    Write-Output ('发布完成：' + (Join-Path $gameRoot 'dist\城邦征战.exe'))
} finally { Pop-Location }
