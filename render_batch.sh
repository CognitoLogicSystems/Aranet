#!/usr/bin/env bash
set -e

TEMPOS=(128 140 152 174)

echo "[+] Compiling JelioBeats Engine..."
javac JelioBeats.java

echo "[+] Rendering Tempos..."
for bpm in "${TEMPOS[@]}"; do
    filename="patch_the_glow_${bpm}bpm_stereo.wav"
    echo "[*] Rendering BPM: $bpm -> $filename"
    java JelioBeats "$bpm" "$filename"
done
echo "[+] Batch rendering complete."
