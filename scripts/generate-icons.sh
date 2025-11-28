#!/bin/sh
# POSIX shell script to generate icon PNGs and ICNS (if iconutil present)
SRC="src/assets/logo.png"
DSTDIR="src-tauri/icons"

mkdir -p "$DSTDIR"

echo "Generating PNG sizes..."
magick convert "$SRC" -resize 256x256 "$DSTDIR/icon-256.png"
magick convert "$SRC" -resize 128x128 "$DSTDIR/icon-128.png"
magick convert "$SRC" -resize 64x64 "$DSTDIR/icon-64.png"
magick convert "$SRC" -resize 48x48 "$DSTDIR/icon-48.png"
magick convert "$SRC" -resize 32x32 "$DSTDIR/icon-32.png"

if command -v iconutil >/dev/null 2>&1; then
  echo "Building .icns with iconutil..."
  TMPICONSET="/tmp/matrix.iconset"
  rm -rf "$TMPICONSET"
  mkdir -p "$TMPICONSET"
  magick convert "$SRC" -resize 16x16 "$TMPICONSET/icon_16x16.png"
  magick convert "$SRC" -resize 32x32 "$TMPICONSET/icon_16x16@2x.png"
  magick convert "$SRC" -resize 32x32 "$TMPICONSET/icon_32x32.png"
  magick convert "$SRC" -resize 64x64 "$TMPICONSET/icon_32x32@2x.png"
  magick convert "$SRC" -resize 128x128 "$TMPICONSET/icon_128x128.png"
  magick convert "$SRC" -resize 256x256 "$TMPICONSET/icon_128x128@2x.png"
  magick convert "$SRC" -resize 256x256 "$TMPICONSET/icon_256x256.png"
  magick convert "$SRC" -resize 512x512 "$TMPICONSET/icon_256x256@2x.png"
  iconutil -c icns "$TMPICONSET" -o "$DSTDIR/icon.icns"
  rm -rf "$TMPICONSET"
else
  echo "iconutil not found; skipping .icns generation. You can create icon.icns on macOS with iconutil."
fi

# Create ICO for Windows
echo "Creating ICO..."
magick convert "$DSTDIR/icon-256.png" "$DSTDIR/icon-48.png" "$DSTDIR/icon-32.png" "$DSTDIR/icon.ico"

echo "Icons generated in $DSTDIR"
