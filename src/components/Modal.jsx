import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  preventBackdropClick = false
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (!preventBackdropClick && event.target === event.currentTarget) {
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