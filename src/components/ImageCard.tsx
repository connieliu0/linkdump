import React from 'react';

interface ImageCardProps {
  src: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ src }) => {
  return (
    <div className="image-container">
      <img src={src} alt="Pasted content" className="pasted-image" />
    </div>
  );
}; 