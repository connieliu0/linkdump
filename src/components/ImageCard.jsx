// Optional enhancement for ImageCard.jsx
// This wraps the image in a container to better support the fading border effect

import React, { useState, useEffect } from 'react';
import { throttle } from 'lodash';

const ImageCard = React.memo(function ImageCard({ src, itemId, sourceUrl: initialSourceUrl, storage }) {
  const [compressedSrc, setCompressedSrc] = useState(src);
  const [isEditing, setIsEditing] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl || '');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const compressImage = () => {
      const img = new Image();
      
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 300; // Match with paste-item max-width
          
          let width = img.width;
          let height = img.height;
          
          // Only scale down if image is larger than maxWidth
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          try {
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCompressedSrc(compressedDataUrl);
            setImageError(false);
          } catch (e) {
            console.warn('Canvas export failed, using original image:', e);
            setCompressedSrc(src);
          }
        } catch (e) {
          console.error('Error processing image:', e);
          setCompressedSrc(src);
        }
      };

      img.onerror = (e) => {
        console.error('Error loading image:', e);
        setImageError(true);
        // Try loading without crossOrigin as fallback
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setCompressedSrc(src);
          setImageError(false);
        };
        fallbackImg.onerror = () => {
          setImageError(true);
        };
        fallbackImg.src = src;
      };

      // Add a proxy for cross-origin images if needed
      if (src.startsWith('http')) {
        img.src = `https://images.weserv.nl/?url=${encodeURIComponent(src)}`;
      } else {
        img.src = src;
      }
    };

    compressImage();
  }, [src]);

  const handleSourceClick = (e) => {
    e.stopPropagation(); // Prevent PanZoom container click
    setIsEditing(true);
  };

  const handleSourceChange = async (e) => {
    const newSource = e.target.value;
    setSourceUrl(newSource);
    await storage.updateItem(itemId, { sourceUrl: newSource });
  };

  const handleKeyDown = (e) => {
    e.stopPropagation(); // Stop event from reaching PanZoom
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  const handleMouseMove = throttle((e) => {
    // ... your code ...
  }, 16); // ~60fps

  return (
    <div className="image-container">
      {imageError ? (
        <div className="image-error">
          Failed to load image
        </div>
      ) : (
        <img 
          src={compressedSrc} 
          alt="Pasted content"
          className="pasted-image"
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('Error displaying image:', e);
            setImageError(true);
          }}
        />
      )}
      <div 
        className="source-url-container" 
        onClick={handleSourceClick}
        onKeyDown={e => e.stopPropagation()} // Stop all keyboard events
      >
        {isEditing ? (
          <input
            type="text"
            value={sourceUrl}
            onChange={handleSourceChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            className="input-field source-input"
            placeholder="Add source URL"
            autoFocus
          />
        ) : (
          <div className="source-text">
            {sourceUrl ? sourceUrl : 'Click to add source'}
          </div>
        )}
      </div>
    </div>
  );
});

export default ImageCard;