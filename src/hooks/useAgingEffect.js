// src/hooks/useAgingEffect.js
import { useEffect } from 'react';

export const useAgingEffect = (timeSettings) => {
  useEffect(() => {
    if (!timeSettings) return;

    const applyAgingEffects = () => {
      const now = Date.now();
      if (now >= timeSettings.endTime) return;

      // Add debug logging
    //   console.log('Time settings:', {
    //     now,
    //     start: timeSettings.startTime,
    //     end: timeSettings.endTime,
    //     elapsed: now - timeSettings.startTime,
    //     total: timeSettings.endTime - timeSettings.startTime,
    //     progress: Math.min((now - timeSettings.startTime) / (timeSettings.endTime - timeSettings.startTime), 1)
    //   });

      // Calculate progress (0 to 1)
      const totalDuration = timeSettings.endTime - timeSettings.startTime;
      const elapsed = now - timeSettings.startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Debug shadow values
      const baseSize = 30;
      const maxSize = 100;
      const shadowSize = baseSize + (maxSize * progress);
      const innerSize = Math.max(15, shadowSize * 0.3);
    //   console.log('Shadow sizes:', { progress, shadowSize, innerSize });

      // Apply effects to images (in ImageCard component)
      const images = document.querySelectorAll('.pasted-image');
      images.forEach(img => {
        // Add aging classes
        img.classList.add('aged-image');
        const container = img.closest('.image-container');
        
        if (container) {
          // Add class after setting initial values
          container.style.setProperty('--shadow-size', '1px');
          container.style.setProperty('--inner-size', '1px');
          container.classList.add('aged-image-container');
          
          // Calculate shadow sizes based on progress
          const baseSize = 5;
          const maxSize = 30;
          const shadowSize = baseSize + (maxSize * progress);
          const innerSize = Math.max(15, shadowSize * 0.3);
          
          // Update shadow sizes
          container.style.setProperty('--shadow-size', `${shadowSize}px`);
          container.style.setProperty('--inner-size', `${innerSize}px`);
        }

        // Additional dynamic effects
        const sepiaValue = Math.min(progress * 100, 80);
        img.style.filter = `sepia(${sepiaValue}%) brightness(1.1)`;
        img.style.borderRadius = `${progress * 8}px`;
      });

      // Apply effects to text content
      const textElements = document.querySelectorAll('.text-content');
      textElements.forEach(text => {
        const blurValue = Math.min(progress * 1.5, 0.8);
        text.style.filter = `blur(${blurValue}px)`;
        text.style.color = `rgb(${Math.min(50 + progress * 100, 100)}, ${Math.min(40 + progress * 60, 70)}, 0)`;
        text.style.backgroundColor = `rgba(255, 255, ${Math.max(255 - progress * 60, 200)}, ${Math.max(1 - progress * 0.3, 0.7)})`;
      });
      
      // Apply effects to link cards
      const linkCards = document.querySelectorAll('a');
      linkCards.forEach(link => {
        const blurValue = Math.min(progress * 1, 0.6);
        link.style.filter = `blur(${blurValue}px)`;
        link.style.color = `rgb(${Math.min(75 + progress * 80, 75)}, ${Math.min(75 + progress * 40, 75)}, 0)`;
      });

      // Apply aging to card containers
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.style.backgroundColor = `rgba(255, 255, ${Math.max(255 - progress * 80, 180)}, ${Math.max(1 - progress * 0.3, 0.7)})`;
        card.style.boxShadow = `0 10px 15px -3px rgba(${70 + progress * 30}, ${50 + progress * 20}, 0, 0.1)`;
        
        // Add a slight border color change
        card.style.border = `1px solid rgba(${220 - progress * 40}, ${200 - progress * 60}, ${150 - progress * 100}, 0.6)`;
      });
    };

    // Run more frequently to make animation smoother
    applyAgingEffects();
    const interval = setInterval(applyAgingEffects, 100); // Changed from 2000 to 100ms
    
    return () => clearInterval(interval);
  }, [timeSettings]);
};