#!/usr/bin/env bash
set -e

if ! command -v ffmpeg &> /dev/null; then
    echo "[-] Error: ffmpeg is required. Install via brew install ffmpeg"
    exit 1
fi

echo "[+] Transcoding WAV to MP3..."
for wav_file in patch_the_glow_*_stereo.wav; do
    if [ -f "$wav_file" ]; then
        mp3_file="${wav_file%.wav}.mp3"
        ffmpeg -y -i "$wav_file" -codec:a libmp3lame -q:a 2 "$mp3_file" &> /dev/null
        echo "[+] Converted: $mp3_file"
    fi
done
