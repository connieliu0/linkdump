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

  // Only render when visible or in leaving state
  if (!isVisible && !isLeaving) return null;

  return (
    <div 
      className={`inactivity-overlay ${isVisible && !isLeaving ? 'visible' : 'leaving'}`}
      onClick={handleClick}
      style={{ 
        opacity: isLeaving ? 0 : 1,
        transition: `opacity ${TRANSITION_DURATION}ms ease-out`,
        pointerEvents: isLeaving ? 'none' : 'auto'
      }}
    >
      <AnimatedBackground />
      <div className="overlay-content">
        <p>time passes you gently</p>
        <p style={{ opacity: 0.75 }}>click anywhere to continue</p>
      </div>
    </div>
  );
};

export default InactivityOverlay; 