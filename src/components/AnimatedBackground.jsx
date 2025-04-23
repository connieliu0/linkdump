import React, { useEffect, useState } from 'react';
import frame1 from '../assets/timepasses/frame 1.jpg';
import frame2 from '../assets/timepasses/frame 2.jpg';
import frame3 from '../assets/timepasses/frame 3.jpg';
import frame4 from '../assets/timepasses/frame 4.jpg';

const FRAME_DURATION = 700; // 2 seconds per frame
const frames = [frame1, frame2, frame3, frame4];

// Preload images
const preloadImages = () => {
  frames.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

const AnimatedBackground = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const [isForward, setIsForward] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload images on mount
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = frames.length;

    frames.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return; // Don't start animation until images are loaded

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        // If we're on frame 1 and haven't repeated 3 times yet
        if (prev === 0 && repeatCount < 2) {
          setRepeatCount(count => count + 1);
          return 0; // Stay on frame 1
        }
        
        // Reset repeat count when moving from frame 1
        if (prev === 0) {
          setRepeatCount(0);
        }

        // Handle direction changes
        if (isForward) {
          if (prev === frames.length - 1) {
            setIsForward(false);
            return prev - 1;
          }
          return prev + 1;
        } else {
          if (prev === 0) {
            setIsForward(true);
            return prev + 1;
          }
          return prev - 1;
        }
      });
    }, FRAME_DURATION);

    return () => clearInterval(interval);
  }, [repeatCount, isForward, imagesLoaded]);

  // Show nothing or loading state until images are loaded
  if (!imagesLoaded) {
    return <div className="animated-background soft-edge-blur" />;
  }

  return (
    <div
      className="animated-background soft-edge-blur"
      style={{
        backgroundImage: `url(${frames[currentFrame]})`
      }}
    />
  );
};

export default AnimatedBackground; 