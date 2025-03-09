import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  preventBackdropClick = false
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventBackdropClick) {
      onClose?.();
    }
  };

  return (
    <div 
      className="dialog-overlay"
      onClick={handleBackdropClick}
    >
      <div 
        className={`dialog-content ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal; 