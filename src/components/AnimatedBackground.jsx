import React, { useEffect, useState } from 'react';
import frame1 from '../assets/timepasses/frame1.webp';
import frame2 from '../assets/timepasses/frame2.webp';
import frame3 from '../assets/timepasses/frame3.webp';
import frame4 from '../assets/timepasses/frame4.webp';

const FRAME_DURATION = 700; // 700ms per frame
const frames = [frame1, frame2, frame3, frame4];

const AnimatedBackground = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const [isForward, setIsForward] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Debug log the current frame URL
  useEffect(() => {
    console.log('Current frame URL:', frames[currentFrame]);
  }, [currentFrame]);

  // Preload images on mount
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = frames.length;
    console.log('Starting to load images...');

    frames.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        console.log(`Image ${index + 1} loaded:`, src);
        if (loadedCount === totalImages) {
          console.log('All images loaded!');
          setImagesLoaded(true);
        }
      };
      img.onerror = (e) => {
        console.error(`Error loading image ${index + 1}:`, src, e);
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
    return <div className="animated-background" style={{ backgroundColor: '#f5f5f5' }} />;
  }

  return (
    <div
      className="animated-background"
      style={{
        backgroundImage: `url(${frames[currentFrame]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default AnimatedBackground; 