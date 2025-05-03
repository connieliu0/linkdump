// Modified src/hooks/useAgingEffect.js
import { useEffect } from 'react';

// Helper function to generate a random integer between min and max (inclusive)
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Assign random aging classes to an element if not already assigned
const assignAgingClasses = (element) => {
  if (!element.dataset.agingClasses) {
    const sepiaClass = `sepia-var-${randomInt(1, 3)}`;
    const grayscaleClass = `grayscale-var-${randomInt(1, 3)}`;
    const blurClass = `blur-var-${randomInt(1, 3)}`;
    const styleClass = Math.random() > 0.5 ? 'aging-blur' : 'aging-shadow';
    const vignetteClass = Math.random() > 0.5 ? 'aging-vignette' : '';
    const whiteVignetteClass = element.classList.contains('pasted-image') ? 'aging-white-vignette' : '';
    const opacityClass = Math.random() > 0.4 ? 'aging-opacity-fade' : '';
    const minOpacityClass = `min-opacity-${randomInt(6, 8)}`; // 0.6-0.8
    const classes = [
      sepiaClass, grayscaleClass, blurClass, styleClass, vignetteClass, whiteVignetteClass, opacityClass, minOpacityClass
    ].filter(Boolean);
    element.classList.add(...classes);
    element.dataset.agingClasses = classes.join(' ');
  }
};

const getElementSeed = (element) => {
  if (!element._agingSeed) {
    element._agingSeed = {
      sepiaVariation: randomInt(7, 13) / 10, // 0.7 - 1.3
    };
  }
  return element._agingSeed;
};

export const useAgingEffect = (timeSettings) => {
  useEffect(() => {
    if (!timeSettings) return;

    const applyAgingEffects = () => {
      const now = Date.now();
      const endTime = timeSettings.startTime + (timeSettings.duration * 60 * 1000);
      const totalDuration = endTime - timeSettings.startTime;
      const elapsed = now - timeSettings.startTime;
      const progress = now >= endTime ? 1 : Math.min(elapsed / totalDuration, 1);

      // Set the CSS variable globally (or on a parent container if you prefer)
      document.body.style.setProperty('--aging-progress', progress);

      // Assign random classes to images and text/link elements if not already assigned
      const images = document.querySelectorAll('.pasted-image');
      images.forEach(img => {
        assignAgingClasses(img);
        const seed = getElementSeed(img);
        const container = img.closest('.image-container');
        if (container) {
          container.classList.add('aged-image-container');
          // Calculate shadow/inner sizes as before
          const baseSize = 5;
          const maxSize = 30;
          const shadowSize = (baseSize + (maxSize * progress)) * seed.sepiaVariation;
          // innerSize now starts at 0 and grows with progress
          const innerSize = shadowSize * 0.3 * progress;
          container.style.setProperty('--shadow-size', `${shadowSize}px`);
          container.style.setProperty('--inner-size', `${innerSize}px`);
        }
      });
      const elements = document.querySelectorAll('.text-content, .link-preview, .source-input, .source-text');
      elements.forEach(assignAgingClasses);
      const cards = document.querySelectorAll('.card');
      cards.forEach(assignAgingClasses);
    };

    applyAgingEffects();
    const interval = setInterval(applyAgingEffects, 1500);
    return () => clearInterval(interval);
  }, [timeSettings]);
};