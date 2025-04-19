import React, { useState, useCallback } from 'react';
import AnimatedBackground from './AnimatedBackground';

const TRANSITION_DURATION = 2000; // 2 seconds in milliseconds

const InactivityOverlay = ({ isVisible, onDismiss }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClick = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss();
      setIsLeaving(false);
    }, TRANSITION_DURATION);
  }, [onDismiss]);

  if (!isVisible && !isLeaving) return null;

  return (
    <div 
      className={`inactivity-overlay ${isVisible && !isLeaving ? 'visible' : ''}`}
      onClick={handleClick}
    >
      <AnimatedBackground />
      <div className="overlay-content">
        <p>time passes you gently</p>
        <p>click anywhere to continue</p>
      </div>
    </div>
  );
};

export default InactivityOverlay; 