import React, { useEffect, useState } from 'react';
import frame1 from '../assets/timepasses/frame 1.jpg';
import frame2 from '../assets/timepasses/frame 2.jpg';
import frame3 from '../assets/timepasses/frame 3.jpg';

const FRAME_DURATION = 2000; // 2 seconds per frame

const AnimatedBackground = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frames = [frame1, frame2, frame3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, FRAME_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="animated-background"
      style={{
        backgroundImage: `url(${frames[currentFrame]})`
      }}
    />
  );
};

export default AnimatedBackground; 