Add-Type -AssemblyName System.Drawing

$srcPath = "assets-source/CampusSphere-logo-original.png"
$src = [System.Drawing.Image]::FromFile($srcPath)

# 1. 384px lossless PNG
$dest384 = New-Object System.Drawing.Bitmap 384, 384, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g384 = [System.Drawing.Graphics]::FromImage($dest384)
$g384.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g384.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g384.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g384.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g384.DrawImage($src, 0, 0, 384, 384)
$g384.Dispose()
$dest384.Save("public/CampusSphere-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$dest384.Dispose()
Write-Host "Created public/CampusSphere-logo.png (384x384)"

# 2. Multi-size Favicon (16, 32, 48, 64)
$sizes = @(16, 32, 48, 64)
$pngList = New-Object 'System.Collections.Generic.List[byte[]]'

foreach ($sz in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $sz, $sz, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($src, 0, 0, $sz, $sz)
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $pngList.Add($ms.ToArray())
    $ms.Dispose()
}

$src.Dispose()

# Build ICO Binary
$icoMs = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($icoMs)

# ICONDIR (6 bytes)
$bw.Write([uint16]0) # Reserved
$bw.Write([uint16]1) # Type 1 = ICO
$bw.Write([uint16]$sizes.Length) # Image count (4)

$headerSize = 6
$dirEntrySize = 16
$offset = $headerSize + ($sizes.Length * $dirEntrySize)

for ($i = 0; $i -lt $sizes.Length; $i++) {
    $sz = $sizes[$i]
    $data = $pngList[$i]
    $w = if ($sz -ge 256) { 0 } else { [byte]$sz }
    $h = if ($sz -ge 256) { 0 } else { [byte]$sz }

    $bw.Write([byte]$w)             # Width
    $bw.Write([byte]$h)             # Height
    $bw.Write([byte]0)              # Color count
    $bw.Write([byte]0)              # Reserved
    $bw.Write([uint16]1)            # Color planes
    $bw.Write([uint16]32)           # Bits per pixel
    $bw.Write([uint32]$data.Length) # Image size in bytes
    $bw.Write([uint32]$offset)      # Image offset
    $offset += $data.Length
}

for ($i = 0; $i -lt $sizes.Length; $i++) {
    $bytes = $pngList[$i]
    $bw.Write($bytes, 0, $bytes.Length)
}

$bw.Flush()
[System.IO.File]::WriteAllBytes("public/favicon.ico", $icoMs.ToArray())
$bw.Dispose()
$icoMs.Dispose()
Write-Host "Created public/favicon.ico with sizes 16, 32, 48, 64"
