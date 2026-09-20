#!/usr/bin/env bash
set -e

ARCHIVE_NAME="jello_audit_release_bundle.zip"
STAGING_DIR="release_staging"

python3 validate_contacts.py outreach_tracker.csv
./render_batch.sh
./convert_mp3.sh

echo "[+] Packaging release bundle..."
mkdir -p "$STAGING_DIR"
cp patch_the_glow_*_stereo.mp3 "$STAGING_DIR/" 2>/dev/null || true
if [ -f "thumbnail.html" ]; then cp thumbnail.html "$STAGING_DIR/"; fi

cd "$STAGING_DIR"
zip -r "../$ARCHIVE_NAME" ./*
cd ..
rm -rf "$STAGING_DIR"

rm -f patch_the_glow_*_stereo.wav
echo "[+] Pipeline execution complete: $ARCHIVE_NAME"
