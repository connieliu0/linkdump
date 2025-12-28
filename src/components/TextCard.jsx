import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

const TextCard = React.memo(function TextCard({ 
  content, 
  itemId, 
  sourceUrl: initialSourceUrl, 
  isEmpty, 
  showSourceUrl = false, 
  onInputActiveChange,
  type, 
  storage, 
  isSelected, 
  wasDragged,
  onDoubleClick,
  canSeparate,
  onSeparate
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isContentEditing, setIsContentEditing] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl || '');
  const [cardContent, setCardContent] = useState(content || '');
  const contentRef = useRef(null);
  const textLength = useRef(null);
  const textWidth = useRef(null);
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef(null);
  const isBlurringRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const blurTimeoutRef = useRef(null);

  // Notify parent when editing state changes
  useEffect(() => {
    onInputActiveChange(isContentEditing || isEditing);
  }, [isContentEditing, isEditing, onInputActiveChange]);

  // Add mouse event listeners to track mouse state
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.target.closest('.text-container')) {
        isMouseDownRef.current = true;
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleContentClick = useCallback((e) => {
    e.stopPropagation();
    
    if (isContentEditing) return;
    
    // If we were just dragging, ignore this click entirely
    if (wasDragged) {
      clickCountRef.current = 0;
      return;
    }
    
    if (!isSelected) {
      if (onDoubleClick) {
        onDoubleClick();
      }
      return;
    }

    clickCountRef.current += 1;

    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    if (clickCountRef.current === 2) {
      setIsContentEditing(true);
      clickCountRef.current = 0;
    } else {
      // Reset click count after 300ms if no second click
      clickTimeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 300);
    }
  }, [isSelected, wasDragged, onDoubleClick, isContentEditing]);

  const handleSourceClick = useCallback((e) => {
    e.stopPropagation();
    
    if (isEditing) return;
    
    // If we were just dragging, ignore this click entirely
    if (wasDragged) {
      clickCountRef.current = 0;
      return;
    }
    
    if (!isSelected) {
      if (onDoubleClick) {
        onDoubleClick();
      }
      return;
    }

    clickCountRef.current += 1;

    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    if (clickCountRef.current === 2) {
      setIsEditing(true);
      clickCountRef.current = 0;
    } else {
      // Reset click count after 300ms if no second click
      clickTimeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 300);
    }
  }, [isSelected, wasDragged, onDoubleClick, isEditing]);

  // Reset click count when selection changes or after drag
  useEffect(() => {
    clickCountRef.current = 0;
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
  }, [isSelected, wasDragged]);

  const handleContentChange = useCallback(async (e) => {
    const newContent = e.target.value;
    setCardContent(newContent);
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      const scrollHeight = contentRef.current.scrollHeight;
      // Maintain minimum two-line height if card was empty when editing started
      const minHeight = wasEmptyWhenEditingStartedRef.current 
        ? parseFloat(getComputedStyle(contentRef.current).fontSize) * 1.4 * 1.5 * 2 
        : 0;
      contentRef.current.style.height = `${Math.max(scrollHeight, minHeight)}px`;
    }
    // Mark as interacted when user types
    hasInteractedRef.current = true;
    await storage.updateItem(itemId, { 
      content: newContent,
      isEmpty: newContent.trim() === ''
    });
  }, [itemId, storage]);

  const handleSourceChange = useCallback(async (e) => {
    const newSource = e.target.value;
    setSourceUrl(newSource);
    await storage.updateItem(itemId, { sourceUrl: newSource });
  }, [itemId, storage]);

  const handleContentKeyDown = useCallback((e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      setIsContentEditing(false);
    }
  }, []);

  const handleSourceKeyDown = useCallback((e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  }, []);

  const handleFocus = useCallback((e) => {
    e.stopPropagation();
    isBlurringRef.current = false;
  }, []);

  const handleBlur = useCallback((e) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    if (isMouseDownRef.current) {
      e.preventDefault();
      e.target.focus();
      return;
    }

    if (isBlurringRef.current) {
      return;
    }

    isBlurringRef.current = true;

    blurTimeoutRef.current = setTimeout(() => {
      if (e.target.classList.contains('content-input')) {
        setIsContentEditing(false);
      } else {
        setIsEditing(false);
      }
      isBlurringRef.current = false;
    }, 200);
  }, []);

  // Determine if any input is active
  const isInputActive = isContentEditing || isEditing;

  // Handle separate button click
  const handleSeparateClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onSeparate) {
      onSeparate();
    }
  }, [onSeparate]);

  // Render the separate button - always at top of canvas when selected
  const renderSeparateButton = () => {
    if (!canSeparate || !onSeparate || !isSelected) return null;

    const button = (
      <button
        onClick={handleSeparateClick}
        className="separate-button separate-button-fixed"
      >
        separate by line
      </button>
    );

    return ReactDOM.createPortal(button, document.body);
  };

  // Track if user has interacted with the card (to prevent re-auto-editing after blur)
  const hasInteractedRef = useRef(false);
  // Track if card was empty when editing started (to maintain two-line height)
  const wasEmptyWhenEditingStartedRef = useRef(false);
  
  useEffect(() => {
    // Auto-edit when empty (card is ready for input)
    // Only auto-edit if user hasn't interacted yet (prevents re-editing after blur)
    if (isEmpty && !isContentEditing && !hasInteractedRef.current) {
      setIsContentEditing(true);
      wasEmptyWhenEditingStartedRef.current = true; // Track that it was empty when editing started
    }
  }, [isEmpty, isContentEditing, itemId]);
  
  // Track when user interacts with the card
  useEffect(() => {
    if (isContentEditing) {
      hasInteractedRef.current = true;
      // If we're entering edit mode and the card is empty, mark it
      if (isEmpty) {
        wasEmptyWhenEditingStartedRef.current = true;
      }
    } else {
      // Reset when leaving edit mode
      wasEmptyWhenEditingStartedRef.current = false;
    }
  }, [isContentEditing, isEmpty]);

  // Only set cursor position when first entering edit mode
  const isFirstEdit = useRef(true);
  useEffect(() => {
    if ((isContentEditing || isEditing) && contentRef.current && isFirstEdit.current) {
      contentRef.current.selectionStart = contentRef.current.value.length;
      contentRef.current.selectionEnd = contentRef.current.value.length;
      isFirstEdit.current = false;
    }
    if (!isContentEditing && !isEditing) {
      isFirstEdit.current = true;
    }
  }, [isContentEditing, isEditing]);

  return (
    <div className={`text-container ${isInputActive ? 'input-active' : ''}`}>
      {renderSeparateButton()}
      <div className="text-content">
        {isContentEditing ? (
          <textarea
            ref={contentRef}
            value={cardContent}
            onChange={handleContentChange}
            onKeyDown={handleContentKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`input-field content-input ${type === 'newText' ? 'new-text' : 'pasted-text'}`}
            placeholder={isEmpty ? "Click to edit" : ""}
            style={{ 
              height: textLength.current ? `${textLength.current}px` : (isEmpty ? 'auto' : 'auto'),
              minHeight: (isEmpty || wasEmptyWhenEditingStartedRef.current) ? 'calc(1.4em * 1.5 * 2)' : 'auto',
              minWidth: textWidth.current ? `${textWidth.current}px` : '200px',
              width: isEmpty ? '304px' : (textWidth.current ? `${textWidth.current}px` : 'auto'),
              resize: 'none',
              boxSizing: 'border-box'
            }}
            autoFocus
          />
        ) : (
          <div 
            className={`${isEmpty ? 'empty-content' : ''} editable ${type === 'newText' ? 'new-text' : 'pasted-text'}`}
            onClick={handleContentClick}
            ref={el => {
              if (el) {
                textLength.current = el.clientHeight;
                textWidth.current = el.clientWidth;
              }
            }}
          >
            {cardContent || (isEmpty ? 'Click to edit' : '')}
          </div>
        )}
      </div>
      
      {showSourceUrl && !isEmpty && (
        <div 
          className="source-url-container"
          onClick={handleSourceClick}
        >
          {isEditing ? (
            <input
              type="text"
              value={sourceUrl}
              onChange={handleSourceChange}
              onKeyDown={handleSourceKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
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
      )}
    </div>
  );
});

export default TextCard; 