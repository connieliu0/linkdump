#!/bin/bash
# Compress every video in the current folder into background.mp4, background.webm, and fallback.jpg versions.

# Create an output folder (so originals and outputs stay separate)
mkdir -p converted

# Loop through all video files (you can adjust extensions as needed)
for file in *.MOV; do
  # Skip if no matching files exist
  [ -e "$file" ] || continue

  # Get base name (strip extension)
  base="${file%.*}"

  echo "🎞️ Processing: $file"

  # Convert to MP4 (H.264)
  ffmpeg -y -i "$file" \
    -an \
    -c:v libx264 \
    -crf 28 \
    -preset veryfast \
    -vf "scale=1280:-2" \
    "converted/${base}.mp4"

  # Convert to WebM (VP9)
  ffmpeg -y -i "$file" \
    -an \
    -c:v libvpx-vp9 \
    -b:v 0 -crf 30 \
    -vf "scale=1280:-2" \
    "converted/${base}.webm"

  # Extract poster image
  ffmpeg -y -i "$file" -ss 00:00:01.000 -vframes 1 "converted/${base}.jpg"

  echo "✅ Done: $base"
done

echo "✨ All videos converted! Check the 'converted/' folder."
