#!/usr/bin/env sh
# Regenerates the static social/tab images from their HTML sources.
# Only needed if you edit scripts/og.html, scripts/icon.html or public/favicon.svg.
#
#   sh scripts/make-images.sh
set -e
cd "$(dirname "$0")/.."
CLIP=1200,630 node scripts/shot.mjs "file://$PWD/scripts/og.html"   public/og-image.png        3000 1240 700
CLIP=180,180   node scripts/shot.mjs "file://$PWD/scripts/icon.html" public/apple-touch-icon.png 1500 260 260
echo "Regenerated public/og-image.png and public/apple-touch-icon.png"
