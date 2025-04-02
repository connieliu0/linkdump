import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = ''
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="dialog-overlay"
      onClick={handleBackdropClick}
    >
      <div className={`dialog-content ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default Modal; 