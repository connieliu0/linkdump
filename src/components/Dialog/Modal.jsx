import React, { useState, useEffect, memo, useCallback } from 'react';
import './Modal.css';

const Modal = memo(({ 
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
    if (isOpen && !shouldRender) {
      setShouldRender(true);
      setIsClosing(false);
      // Use RAF to ensure state updates are batched
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else if (!isOpen && shouldRender && !isClosing) {
      setIsVisible(false);
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  const handleBackdropClick = useCallback((e) => {
    if (!preventBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  }, [preventBackdropClick, onClose]);

  const handleContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!shouldRender) return null;

  const hasButtons = primaryButton || secondaryButton;
  


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
              <button 
                onClick={primaryButton.onClick}
                disabled={primaryButton.disabled}
              >
                {primaryButton.disabled ? 'Loading...' : primaryButton.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal; 