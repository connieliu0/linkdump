import { useEffect } from 'react';

export const useBackgroundAnimation = (timeSettings) => {
  useEffect(() => {
    const updateBackgroundColor = () => {
      const canvasElement = document.querySelector('.canvas-area__in');
      if (!canvasElement || !timeSettings) return;

      const now = Date.now();
      const totalDuration = timeSettings.endTime - timeSettings.startTime;
      const halfwayPoint = timeSettings.halfwayPoint;
      const isBeforeHalfway = now < halfwayPoint;

      // Calculate progress percentage (0 to 100)
      let progress;
      if (isBeforeHalfway) {
        // First half: 0 to 100% (green growing)
        progress = ((now - timeSettings.startTime) / (halfwayPoint - timeSettings.startTime)) * 100;
      } else {
        // Second half: 0 to 100% (red growing)
        progress = ((now - halfwayPoint) / (timeSettings.endTime - halfwayPoint)) * 100;
      }

      // Clamp progress between 0 and 100
      progress = Math.max(0, Math.min(100, progress));

      // Scale the progress to start subtle but end at 100%
      const scaledProgress = Math.min(10 + (progress * 0.9), 100); // Starts at 10%, grows to 100%

      // Changed 90deg to 180deg for vertical gradient
      const gradient = isBeforeHalfway
        ? `linear-gradient(0deg, #dcfce7 ${scaledProgress}%, rgba(255,255,255,0.8) 100%)`
        : `linear-gradient(0deg, #fee2e2 ${scaledProgress}%, rgba(255,255,255,0.8) 100%)`;

      console.log('Updating background:', {
        now,
        progress: `${scaledProgress.toFixed(1)}%`,
        isBeforeHalfway,
        gradient
      });

      canvasElement.style.background = gradient;
    };

    // Update initially
    updateBackgroundColor();

    // Update more frequently for smoother animation
    const interval = setInterval(updateBackgroundColor, 50); // 50ms for smoother animation

    return () => clearInterval(interval);
  }, [timeSettings]);
};