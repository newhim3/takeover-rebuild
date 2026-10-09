param()
$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$gamePackage = Get-Content -LiteralPath (Join-Path $gameRoot 'dist/lan-package-manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$gameArchivePath = Join-Path $gameRoot 'dist/城邦征战-局域网便携版.zip'
$gameTemporaryPath = $gameArchivePath + '.building'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$gameArchiveFile = [System.IO.File]::Open($gameTemporaryPath, [System.IO.FileMode]::Create)
$gameArchive = New-Object System.IO.Compression.ZipArchive($gameArchiveFile, [System.IO.Compression.ZipArchiveMode]::Create, $false)
$gamePackedCount = 0
try {
    foreach ($gameEntry in $gamePackage.entries) {
        $gameSource = Join-Path $gameRoot $gameEntry.file
        $gameSourceFile = [System.IO.File]::Open($gameSource, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
        try {
            if ($gameSourceFile.Length -ne $gameEntry.bytes -or $gameEntry.sha256 -notmatch '^[a-f0-9]{64}$') { throw ('文件长度或校验配置错误，请重建清单：' + $gameEntry.file) }
            $gameHasher = [System.Security.Cryptography.SHA256]::Create()
            try { $gameHash = [BitConverter]::ToString($gameHasher.ComputeHash($gameSourceFile)).Replace('-','').ToLowerInvariant() } finally { $gameHasher.Dispose() }
            if ($gameHash -ne $gameEntry.sha256) { throw ('清单生成后文件已改变，请重建清单：' + $gameEntry.file) }
            $gameSourceFile.Position = 0
            $gameZipEntry = $gameArchive.CreateEntry(('城邦征战/' + $gameEntry.file), [System.IO.Compression.CompressionLevel]::Fastest)
            $gameZipFile = $gameZipEntry.Open()
            try { $gameSourceFile.CopyTo($gameZipFile) } finally { $gameZipFile.Dispose() }
        } finally { $gameSourceFile.Dispose() }
        $gamePackedCount++
        if ($gamePackedCount % 2000 -eq 0) { Write-Output ("已打包 {0}/{1} 文件" -f $gamePackedCount, $gamePackage.entries.Count) }
    }
} finally { $gameArchive.Dispose(); $gameArchiveFile.Dispose() }
Move-Item -LiteralPath $gameTemporaryPath -Destination $gameArchivePath -Force
$gamePackageResult = [ordered]@{build=$gamePackage.build; files=$gamePackedCount; bytes=(Get-Item -LiteralPath $gameArchivePath).Length; path=$gameArchivePath}
$gamePackageResult.manifestHash = (Get-FileHash -LiteralPath (Join-Path $gameRoot 'dist/lan-package-manifest.json') -Algorithm SHA256).Hash.ToLowerInvariant()
$gamePackageResult.archiveHash = (Get-FileHash -LiteralPath $gameArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
$gamePackageResult | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $gameRoot 'dist/release-package.json') -Encoding UTF8
$gamePackageResult | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $gameRoot '.tools/r25-package-check.json') -Encoding UTF8
$gamePackageResult | ConvertTo-Json
