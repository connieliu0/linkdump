// src/hooks/useBackgroundAnimation.js
import { useEffect } from 'react';

export const useBackgroundAnimation = (timeSettings) => {
  useEffect(() => {
    if (!timeSettings) return;
    
    const applyBackgroundEffects = () => {
      const now = Date.now();
      if (now >= timeSettings.endTime) return;
      
      // Calculate progress (0 to 1)
      const totalDuration = timeSettings.endTime - timeSettings.startTime;
      const elapsed = now - timeSettings.startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // Gradually change the background to a yellowed, aged paper look
      document.body.style.backgroundColor = `rgb(${255}, ${255 - progress * 20}, ${255 - progress * 50})`;
      
      // If we're past the halfway point, add a subtle vignette to the entire canvas
      if (progress > 0.5) {
        const canvasArea = document.querySelector('.canvas-area');
        if (canvasArea) {
          const vignetteIntensity = (progress - 0.5) * 2 * 30; // Scale from 0-30px
          canvasArea.style.boxShadow = `inset 0 0 ${vignetteIntensity}px ${vignetteIntensity * 2}px rgba(160, 120, 0, ${(progress - 0.5) * 0.3})`;
        }
      }
    };
    
    // Apply immediately and set interval
    applyBackgroundEffects();
    const interval = setInterval(applyBackgroundEffects, 3000);
    
    return () => clearInterval(interval);
  }, [timeSettings]);
};