#!/bin/bash
# Optimized video compression script for web delivery
# This will significantly reduce file sizes while maintaining quality

echo "🎬 Starting video optimization for web delivery..."

# Create optimized output folder
mkdir -p optimized

# Process the main video files
for file in public/assets/output.*; do
  if [ -e "$file" ]; then
    base=$(basename "$file" | cut -d. -f1)
    ext=$(basename "$file" | cut -d. -f2)
    
    echo "🎞️ Optimizing: $file"
    
    if [ "$ext" = "mp4" ]; then
      # Optimize MP4 for web - much smaller file size
      ffmpeg -y -i "$file" \
        -c:v libx264 \
        -crf 32 \
        -preset slow \
        -profile:v baseline \
        -level 3.0 \
        -movflags +faststart \
        -vf "scale=1280:720" \
        -an \
        -maxrate 2M \
        -bufsize 4M \
        "optimized/${base}_optimized.mp4"
        
      # Create a very small preview version
      ffmpeg -y -i "$file" \
        -c:v libx264 \
        -crf 35 \
        -preset ultrafast \
        -vf "scale=640:360" \
        -an \
        -t 3 \
        -maxrate 500k \
        -bufsize 1M \
        "optimized/${base}_preview.mp4"
    fi
    
    if [ "$ext" = "webm" ]; then
      # Optimize WebM for web - even smaller than MP4
      ffmpeg -y -i "$file" \
        -c:v libvpx-vp9 \
        -crf 35 \
        -b:v 0 \
        -vf "scale=1280:720" \
        -an \
        -deadline good \
        -cpu-used 2 \
        "optimized/${base}_optimized.webm"
        
      # Create a very small preview version
      ffmpeg -y -i "$file" \
        -c:v libvpx-vp9 \
        -crf 40 \
        -b:v 0 \
        -vf "scale=640:360" \
        -an \
        -t 3 \
        -deadline realtime \
        "optimized/${base}_preview.webm"
    fi
  fi
done

# Create optimized poster images
echo "🖼️ Creating optimized poster images..."
ffmpeg -y -i "public/assets/output.mp4" \
  -ss 00:00:01.000 \
  -vframes 1 \
  -vf "scale=1280:720" \
  -q:v 2 \
  "optimized/poster_optimized.jpg"

# Create a very small poster for quick loading
ffmpeg -y -i "public/assets/output.mp4" \
  -ss 00:00:01.000 \
  -vframes 1 \
  -vf "scale=320:180" \
  -q:v 3 \
  "optimized/poster_small.jpg"

echo "✅ Video optimization complete!"
echo "📊 File size comparison:"
echo "Original files:"
ls -lh public/assets/output.*
echo ""
echo "Optimized files:"
ls -lh optimized/
