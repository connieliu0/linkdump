// src/hooks/usePaperAgingEffect.js
import { useEffect } from 'react';

export const usePaperAgingEffect = (timeSettings) => {
  useEffect(() => {
    if (!timeSettings) return;

    // Create and inject the noise SVG once
    const createNoiseSVG = () => {
      // Check if filter already exists
      if (document.getElementById('paperNoiseFilter')) return;
      
      // Create the SVG noise filter
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.style.position = "absolute";
      svg.style.visibility = "hidden";
      
      // Create filter
      const filter = document.createElementNS(svgNS, "filter");
      filter.setAttribute("id", "paperNoiseFilter");
      
      // Create turbulence
      const turbulence = document.createElementNS(svgNS, "feTurbulence");
      turbulence.setAttribute("type", "fractalNoise");
      turbulence.setAttribute("baseFrequency", "0.65");
      turbulence.setAttribute("numOctaves", "3");
      turbulence.setAttribute("stitchTiles", "stitch");
      
      // Add turbulence to filter
      filter.appendChild(turbulence);
      
      // Add filter to SVG
      svg.appendChild(filter);
      
      // Add SVG to document
      document.body.appendChild(svg);
    };
    
    // Apply paper aging effects
    const applyPaperAgingEffects = () => {
      const now = Date.now();
      if (now >= timeSettings.endTime) return;
      
      // Calculate progress (0 to 1)
      const totalDuration = timeSettings.endTime - timeSettings.startTime;
      const elapsed = now - timeSettings.startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // Get the canvas area or create a paper overlay if it doesn't exist
      const canvasArea = document.querySelector('.canvas-area__in');
      if (!canvasArea) return;
      
      // Create paper overlay if it doesn't exist
      let paperOverlay = document.getElementById('paper-aging-overlay');
      if (!paperOverlay) {
        paperOverlay = document.createElement('div');
        paperOverlay.id = 'paper-aging-overlay';
        paperOverlay.style.position = 'absolute';
        paperOverlay.style.inset = '0';
        paperOverlay.style.pointerEvents = 'none';
        paperOverlay.style.zIndex = '1';
        canvasArea.style.position = 'relative';
        canvasArea.appendChild(paperOverlay);
      }
      
      // Apply yellowing effect that increases with time
      const cornerYellowing = Math.min(progress * 0.9, 0.7);
      const centerYellowing = Math.min(progress * 0.4, 0.3);
      
      // Fixed intensities for each corner (no randomness)
      const topLeftIntensity = 0.95;
      const topRightIntensity = 0.85;
      const bottomLeftIntensity = 0.9;
      const bottomRightIntensity = 1.0;
      
      // Create radial gradients for each corner with darker brown color
      // The color gets darker as progress increases
      const baseColor = {
        r: 139,
        g: Math.max(69 - (progress * 30), 39), // Darken the brown color over time
        b: Math.max(19 - (progress * 10), 9)
      };
      
      paperOverlay.style.background = `
        radial-gradient(circle at 0 0, rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${cornerYellowing * topLeftIntensity}), transparent 80%),
        radial-gradient(circle at 100% 0, rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${cornerYellowing * topRightIntensity}), transparent 60%),
        radial-gradient(circle at 0 100%, rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${cornerYellowing * bottomLeftIntensity}), transparent 70%),
        radial-gradient(circle at 100% 100%, rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${cornerYellowing * bottomRightIntensity}), transparent 80%),
        radial-gradient(circle at 50% 50%, rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${centerYellowing}), transparent 70%)
      `;
      
      // Apply noise with increased contrast and brightness
      paperOverlay.style.backdropFilter = `url(#paperNoiseFilter) contrast(${100 + progress * 120}%) brightness(${100 + progress * 70}%)`;
      
      // Set the opacity of the aging effect overlay
      paperOverlay.style.opacity = Math.min(progress * 0.6, 0.6).toFixed(2);
      
      // Set the texture opacity directly on the canvas area
      canvasArea.style.setProperty('--texture-opacity', Math.min(progress * 0.8, 0.8).toFixed(2));
      
      // Add stains with fixed positions
      if (progress > 0.3) {
        const stainIntensity = (progress - 0.3) * 2 * 0.5;
        const stainCount = Math.floor((progress - 0.3) * 15);
        
        // Use fixed positions for stains
        const stainPositions = [
          { x: 15, y: 25, size: 12 },
          { x: 85, y: 15, size: 8 },
          { x: 35, y: 75, size: 15 },
          { x: 65, y: 85, size: 10 },
          { x: 45, y: 35, size: 18 },
          { x: 75, y: 55, size: 12 },
          { x: 25, y: 65, size: 10 },
          { x: 90, y: 45, size: 15 },
          { x: 10, y: 90, size: 8 },
          { x: 50, y: 95, size: 12 },
          { x: 80, y: 30, size: 10 },
          { x: 20, y: 40, size: 15 },
          { x: 60, y: 20, size: 8 },
          { x: 40, y: 60, size: 12 },
          { x: 70, y: 70, size: 10 }
        ];
        
        let stainGradients = '';
        for (let i = 0; i < Math.min(stainCount, stainPositions.length); i++) {
          const { x, y, size } = stainPositions[i];
          stainGradients += `radial-gradient(circle at ${x}% ${y}%, rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${stainIntensity}), transparent ${size}%),`;
        }
        
        if (stainGradients) {
          stainGradients = stainGradients.slice(0, -1);
          paperOverlay.style.background += `, ${stainGradients}`;
        }
      }
    };
    
    // Create noise SVG filter
    createNoiseSVG();
    
    // Apply immediately and set interval
    applyPaperAgingEffects();
    const interval = setInterval(applyPaperAgingEffects, 2000);
    
    // Cleanup function
    return () => {
      clearInterval(interval);
      const paperOverlay = document.getElementById('paper-aging-overlay');
      if (paperOverlay) paperOverlay.remove();
    };
  }, [timeSettings?.startTime, timeSettings?.endTime]); // Only depend on the specific properties we use
};