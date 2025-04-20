import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children,
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div className="dialog-content">
        {children}
      </div>
    </div>
  );
};

export default Modal; 