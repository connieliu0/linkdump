// Modified src/hooks/useAgingEffect.js
import { useEffect } from 'react';

// Helper function to generate a random number between min and max
const random = (min, max) => Math.random() * (max - min) + min;

// Generate a random seed for each element that will be consistent across renders
const getElementSeed = (element) => {
  if (!element._agingSeed) {
    element._agingSeed = {
      sepiaVariation: random(0.7, 1.3),
      grayscaleVariation: random(0.5, 1.5),
      blurVariation: random(0.8, 1.2),
      agingStyle: Math.random() > 0.5 ? 'blur' : 'shadow',
      shadowColor: `rgba(${Math.floor(random(30, 70))}, ${Math.floor(random(20, 50))}, 0, 0.8)`,
      hasVignette: Math.random() > 0.5, // 50% chance of having vignette
      opacityFade: Math.random() > 0.4, // 60% chance of having opacity fade
      minOpacity: random(0.6, 0.8) // Random minimum opacity between 0.4 and 0.7
    };
  }
  return element._agingSeed;
};

export const useAgingEffect = (timeSettings) => {
  useEffect(() => {
    if (!timeSettings) return;

    const applyAgingEffects = () => {
      const now = Date.now();
      const endTime = timeSettings.startTime + (timeSettings.duration * 60 * 1000); // Convert minutes to milliseconds
      
      // Instead of returning, use maximum progress when expired
      const totalDuration = endTime - timeSettings.startTime;
      const elapsed = now - timeSettings.startTime;
      const progress = now >= endTime ? 1 : Math.min(elapsed / totalDuration, 1);

      // Apply effects to images
      const images = document.querySelectorAll('.pasted-image');
      images.forEach(img => {
        const seed = getElementSeed(img);
        img.classList.add('aged-image');
        const container = img.closest('.image-container');
        
        if (container) {
          container.style.setProperty('--shadow-size', '1px');
          container.style.setProperty('--inner-size', '1px');
          container.classList.add('aged-image-container');
          
          const baseSize = 5;
          const maxSize = 30;
          const shadowSize = (baseSize + (maxSize * progress)) * seed.sepiaVariation;
          const innerSize = Math.max(15, shadowSize * 0.3);
          
          container.style.setProperty('--shadow-size', `${shadowSize}px`);
          container.style.setProperty('--inner-size', `${innerSize}px`);
        }

        const sepiaValue = Math.min(progress * 100 * seed.sepiaVariation, 80);
        const grayscaleValue = Math.min(progress * 50 * seed.grayscaleVariation, 40);
        
        // Apply opacity fade if the seed indicates it
        if (seed.opacityFade) {
          const opacity = 1 - (progress * (1 - seed.minOpacity));
          img.style.opacity = opacity.toFixed(2);
        }
        
        img.style.filter = `sepia(${sepiaValue}%) grayscale(${grayscaleValue}%) brightness(1.1)`;
        img.style.borderRadius = `${progress * 8}px`;
      });

      // Apply effects to text content and links
      const elements = document.querySelectorAll('.text-content, .link-preview, .source-input, .source-text');
      elements.forEach(element => {
        const seed = getElementSeed(element);
        
        if (seed.agingStyle === 'blur') {
          // Blur aging style
          const blurValue = Math.min(progress * 1.5 * seed.blurVariation, 0.8);
          element.style.filter = `blur(${blurValue}px)`;
          element.style.textShadow = 'none';
        } else {
          // Shadow aging style
          element.style.filter = 'none';
          const shadowIntensity = Math.min(progress * 15 * seed.blurVariation, 15);
          element.style.textShadow = `0px 0px ${shadowIntensity}px ${seed.shadowColor}`;
        }

        // Apply opacity fade if the seed indicates it
        if (seed.opacityFade) {
          const opacity = 1 - (progress * (1 - seed.minOpacity));
          element.style.opacity = opacity.toFixed(2);
        }

        // Apply vignette effect for selected cards
        if (seed.hasVignette) {
          const vignetteIntensity = Math.min(progress * 0.3, 0.3);
          element.style.boxShadow = `inset 0 0 ${Math.min(progress * 60, 60)}px rgba(0, 0, 0, ${vignetteIntensity})`;
          element.style.position = 'relative';
          element.style.isolation = 'isolate';
        }

        // For source inputs, use a more subtle color change
        if (element.classList.contains('source-input') || element.classList.contains('source-text')) {
          const colorProgress = progress * seed.sepiaVariation;
          element.style.color = `rgb(${Math.min(100 + colorProgress * 50, 150)}, ${Math.min(90 + colorProgress * 30, 120)}, ${Math.min(20 + colorProgress * 20, 40)})`;
          // Don't change the background for source inputs
          return;
        }

        element.style.backgroundColor = `rgba(255, 255, ${Math.max(255 - progress * 60, 200)}, ${Math.max(1 - progress * 0.3, 0.7)})`;

        // Apply color to all text elements within link preview
        const textElements = element.classList.contains('link-preview') 
          ? element.querySelectorAll('.link-description, .link-domain')
          : [element];
          
        textElements.forEach(el => {
          const colorProgress = progress * seed.sepiaVariation;
          el.style.color = `rgb(${Math.min(50 + colorProgress * 100, 100)}, ${Math.min(40 + colorProgress * 60, 70)}, 0)`;
        });
      });

      // Apply aging to card containers
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        const seed = getElementSeed(card);
        const colorVariation = seed.sepiaVariation;
        
        card.style.backgroundColor = `rgba(255, 255, ${Math.max(255 - progress * 80 * colorVariation, 180)}, ${Math.max(1 - progress * 0.3, 0.7)})`;
        card.style.boxShadow = `0 10px 15px -3px rgba(${70 + progress * 30}, ${50 + progress * 20}, 0, ${0.1 * seed.sepiaVariation})`;
        card.style.border = `1px solid rgba(${220 - progress * 40}, ${200 - progress * 60}, ${150 - progress * 100}, ${0.6 * colorVariation})`;
      });
    };

    applyAgingEffects();
    const interval = setInterval(applyAgingEffects, 100);
    
    return () => clearInterval(interval);
  }, [timeSettings]);
};