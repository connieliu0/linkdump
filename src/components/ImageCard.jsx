// src/components/ImageCard.jsx
import React, { useState, useEffect } from 'react';

const ImageCard = ({ src }) => {
  const [compressedSrc, setCompressedSrc] = useState(src);

  useEffect(() => {
    const compressImage = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Max dimensions
        const maxWidth = 1200;
        const maxHeight = 1200;

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight * width) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // 0.8 quality
        setCompressedSrc(compressedDataUrl);
      };
      img.src = src;
    };

    compressImage();
  }, [src]);

  return (
    <div className="bg-white p-2 rounded-lg shadow-lg">
      <img 
        src={compressedSrc} 
        alt="Pasted content" 
        className="max-w-[200px] h-auto"
      />
    </div>
  );
};

export default ImageCard;