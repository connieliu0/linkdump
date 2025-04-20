import React, { useState, useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children,
  preventBackdropClick,
  title,
  description,
  primaryButton,
  secondaryButton,
  className = '',
  hasOverlay = false
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    console.log('Modal effect triggered:', { isOpen, isClosing, shouldRender, isVisible });
    
    if (isOpen) {
      // Opening sequence
      setShouldRender(true);
      // Wait for next frame to start animation
      const openTimer = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(openTimer);
    } else {
      // Closing sequence
      if (shouldRender) {
        setIsVisible(false);
        const closeTimer = setTimeout(() => {
          setShouldRender(false);
        }, 300);
        return () => clearTimeout(closeTimer);
      }
    }
  }, [isOpen]); // Only depend on isOpen

  const handleBackdropClick = (e) => {
    if (!preventBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!shouldRender) return null;

  const hasButtons = primaryButton || secondaryButton;
  
  console.log('Rendering modal with classes:', {
    isClosing,
    hasOverlay,
    isVisible,
    shouldRender
  });

  return (
    <div 
      className={`dialog-overlay ${hasOverlay ? 'with-overlay' : ''} ${isVisible ? 'visible' : ''}`}
      onClick={handleBackdropClick}
      style={{ display: 'flex' }}
    >
      <div 
        className={`dialog-content ${className}`}
        onClick={handleContentClick}
        style={{
          transform: `translateY(${!isVisible ? '20px' : '0'})`,
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Title */}
        {title && <h2>{title}</h2>}
        
        {/* Description and Content */}
        <div className="dialog-body">
          {description && <p>{description}</p>}
          {children}
        </div>

        {/* Buttons */}
        {hasButtons && (
          <div className="button-container">
            {secondaryButton && (
              <button onClick={secondaryButton.onClick}>
                {secondaryButton.label}
              </button>
            )}
            {primaryButton && (
              <button onClick={primaryButton.onClick}>
                {primaryButton.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 