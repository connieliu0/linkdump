import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { useDrag } from '../hooks/useDrag';

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
  onDoubleClick 
}) {
  const { state, dispatch } = useCanvas();
  
  // Local editing state
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
  const lastClickTimeRef = useRef(0);
  const lastSelectedIdRef = useRef(null);
  
  // Get card from context
  const card = state.cards.find(c => c.id === itemId);
  if (!card) return null;

  // Use new drag system
  const { handleMouseDown, elementRef } = useDrag({
    onDragStart: () => {
      dispatch({ type: "SELECT_CARD", payload: card.id });
    },
    onDragEnd: (newPosition) => {
      dispatch({
        type: "UPDATE_CARD",
        payload: { id: card.id, updates: { position: newPosition } }
      });
      // Update storage
      if (storage) {
        storage.updateItem(card.id, { position: newPosition });
      }
    },
    disabled: isContentEditing || isEditing
  });

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
    
    if (!card.selected) {
      if (onDoubleClick) {
        onDoubleClick();
      }
      return;
    }

    clickCountRef.current += 1;

    if (clickCountRef.current === 2 && !wasDragged) {
      setIsContentEditing(true);
      clickCountRef.current = 0;
    }
  }, [card.selected, wasDragged, onDoubleClick, isContentEditing]);

  const handleSourceClick = useCallback((e) => {
    e.stopPropagation();
    
    if (isEditing) return;
    
    if (!card.selected) {
      if (onDoubleClick) {
        onDoubleClick();
      }
      return;
    }

    clickCountRef.current += 1;

    if (clickCountRef.current === 2 && !wasDragged) {
      setIsEditing(true);
      clickCountRef.current = 0;
    }
  }, [card.selected, wasDragged, onDoubleClick, isEditing]);

  // Reset click count when selection changes
  useEffect(() => {
    clickCountRef.current = 0;
  }, [card.selected]);

  const handleContentChange = useCallback(async (e) => {
    const newContent = e.target.value;
    setCardContent(newContent);
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
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

  // Selection handling
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    
    if (lastSelectedIdRef.current === itemId && timeSinceLastClick < 300) {
      // Double click - start editing
      setIsContentEditing(true);
      dispatch({ type: "SET_INPUT_ACTIVE", payload: true });
    } else {
      // Single click - select
      dispatch({ type: "SELECT_CARD", payload: itemId });
    }
    
    lastClickTimeRef.current = now;
    lastSelectedIdRef.current = itemId;
  }, [itemId, dispatch]);

  return (
    <div
      ref={elementRef}
      className={`text-container ${isInputActive ? 'input-active' : ''} ${card.selected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${card.position.x}px`,
        top: `${card.position.y}px`,
        cursor: isContentEditing || isEditing ? 'text' : 'move',
        transform: 'translateZ(0)' // Force GPU acceleration
      }}
      onMouseDown={(e) => handleMouseDown(e, card.position)}
      onClick={handleClick}
    >
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
              height: textLength.current ? `${textLength.current}px` : 'auto',
              width: '100%',
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
              if (el) textLength.current = el.clientHeight;
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