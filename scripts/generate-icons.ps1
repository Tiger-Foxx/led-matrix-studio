# PowerShell script to generate icon PNGs and ICO using ImageMagick (magick)
# Requires ImageMagick available as 'magick'

$src = "src/assets/logo.png"
$dstDir = "src-tauri/icons"

if (!(Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir | Out-Null }

Write-Host "Generating PNG sizes..."
magick convert $src -resize 256x256 "$dstDir/icon-256.png"
magick convert $src -resize 128x128 "$dstDir/icon-128.png"
magick convert $src -resize 64x64 "$dstDir/icon-64.png"
magick convert $src -resize 48x48 "$dstDir/icon-48.png"
magick convert $src -resize 32x32 "$dstDir/icon-32.png"

Write-Host "Creating ICO (Windows)"
magick convert "$dstDir/icon-256.png" "$dstDir/icon-48.png" "$dstDir/icon-32.png" "$dstDir/icon.ico"

Write-Host "Done. Icons written to $dstDir"
