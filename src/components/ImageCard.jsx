// Optional enhancement for ImageCard.jsx
// This wraps the image in a container to better support the fading border effect

import React, { useState, useEffect } from 'react';
import { db } from '../utils/storage';

const ImageCard = ({ src, itemId, sourceUrl: initialSourceUrl }) => {
  const [compressedSrc, setCompressedSrc] = useState(src);
  const [isEditing, setIsEditing] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl || '');

  useEffect(() => {
    const compressImage = () => {
      const img = new Image();
      img.onload = () => {
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
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setCompressedSrc(compressedDataUrl);
        } else {
          // Use original image if it's smaller than maxWidth
          setCompressedSrc(src);
        }
      };
      img.src = src;
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
    await db.items.update(itemId, { sourceUrl: newSource });
  };

  const handleKeyDown = (e) => {
    e.stopPropagation(); // Stop event from reaching PanZoom
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="image-container">
      <img 
        src={compressedSrc} 
        alt="Pasted content"
        className="pasted-image"
      />
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
};

export default ImageCard;