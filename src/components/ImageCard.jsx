// Optional enhancement for ImageCard.jsx
// This wraps the image in a container to better support the fading border effect

import React, { useState, useEffect } from 'react';

const ImageCard = ({ src }) => {
  const [compressedSrc, setCompressedSrc] = useState(src);

  useEffect(() => {
    const compressImage = () => {
      const img = new Image();
      img.onload = () => {
        // Compression logic (same as your original)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 1200;
        const maxHeight = 1200;
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

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCompressedSrc(compressedDataUrl);
      };
      img.src = src;
    };

    compressImage();
  }, [src]);

  return (
    <div className="image-container">
      <img 
        src={compressedSrc} 
        alt="Pasted content"
        className="pasted-image"
      />
    </div>
  );
};

export default ImageCard;