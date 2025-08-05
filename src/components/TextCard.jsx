import React, { useState, useRef, useEffect, useCallback } from 'react';

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
  onContentChange
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isContentEditing, setIsContentEditing] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl || '');
  const [cardContent, setCardContent] = useState(content || '');
  const contentRef = useRef(null);
  const textLength = useRef(null);
  const clickCountRef = useRef(0);
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

  // Cleanup blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleContentClick = useCallback((e) => {
    e.stopPropagation();
    
    if (isContentEditing) return;
    
    // Single click to start editing
    setIsContentEditing(true);
  }, [isContentEditing]);

  const handleSourceClick = useCallback((e) => {
    e.stopPropagation();
    
    if (isEditing) return;
    
    // Single click to start editing
    setIsEditing(true);
  }, [isEditing]);

  // Reset click count when selection changes
  useEffect(() => {
    clickCountRef.current = 0;
  }, [isSelected]);

  const handleContentChange = useCallback(async (e) => {
    const newContent = e.target.value;
    setCardContent(newContent);
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
    
    // Update ReactFlow node data
    if (onContentChange) {
      onContentChange(newContent);
    }
    
    // Update storage
    await storage.updateItem(itemId, { 
      content: newContent,
      isEmpty: newContent.trim() === ''
    });
  }, [itemId, storage, onContentChange]);

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

  useEffect(() => {
    if (isEmpty && contentRef.current) {
      setIsContentEditing(true);
    }
  }, [isEmpty]);

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
      <div className="text-content">
        <textarea
          ref={contentRef}
          value={cardContent}
          onChange={handleContentChange}
          onKeyDown={handleContentKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleContentClick}
          className={`content-input nodrag ${isContentEditing ? 'editing' : ''}`}
          placeholder="Type your text here..."
          disabled={!isContentEditing}
          style={{
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            minHeight: '60px',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            color: 'inherit',
            cursor: isContentEditing ? 'text' : 'pointer'
          }}
        />
      </div>
      
      {showSourceUrl && (
        <div className="text-source">
          <input
            type="text"
            value={sourceUrl}
            onChange={handleSourceChange}
            onKeyDown={handleSourceKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleSourceClick}
            className={`source-input nodrag ${isEditing ? 'editing' : ''}`}
            placeholder="Source URL (optional)"
            disabled={!isEditing}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '0.8em',
              color: 'inherit',
              opacity: 0.7,
              cursor: isEditing ? 'text' : 'pointer'
            }}
          />
        </div>
      )}
    </div>
  );
});

export default TextCard; 