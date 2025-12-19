// src/components/SectionCard.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

const MIN_SECTION_WIDTH = 150;
const MIN_SECTION_HEIGHT = 100;

const SectionCard = React.memo(function SectionCard({
  section,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onResizeStart,
  onResizeEnd,
  onDragStart,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(section.name || 'Untitled Section');
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const inputRef = useRef(null);
  const sectionRef = useRef(null);
  const startBoundsRef = useRef(null);
  const startMouseRef = useRef(null);

  // Update local state when section prop changes
  useEffect(() => {
    setName(section.name || 'Untitled Section');
  }, [section.name]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleNameChange = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const handleNameBlur = useCallback(() => {
    setIsEditing(false);
    if (name !== section.name) {
      onUpdate(section.id, { name: name || 'Untitled Section' });
    }
  }, [name, section.id, section.name, onUpdate]);

  const handleNameKeyDown = useCallback((e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setName(section.name);
      setIsEditing(false);
    }
  }, [handleNameBlur, section.name]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8297760a-d8b0-4708-b45f-d146dc98aa2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SectionCard.jsx:handleClick',message:'Section clicked',data:{sectionId:section.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    onSelect(section.id);
  }, [onSelect, section.id]);

  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation();
    onDelete(section.id);
  }, [onDelete, section.id]);

  // Resize handlers
  const handleResizeMouseDown = useCallback((e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8297760a-d8b0-4708-b45f-d146dc98aa2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SectionCard.jsx:handleResizeMouseDown',message:'Resize started',data:{handle,sectionId:section.id,bounds:section.bounds},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    setIsResizing(true);
    setResizeHandle(handle);
    startBoundsRef.current = { ...section.bounds };
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    
    if (onResizeStart) {
      onResizeStart(section.id);
    }
  }, [section.bounds, section.id, onResizeStart]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!startBoundsRef.current || !startMouseRef.current) return;

      const dx = e.clientX - startMouseRef.current.x;
      const dy = e.clientY - startMouseRef.current.y;
      const start = startBoundsRef.current;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8297760a-d8b0-4708-b45f-d146dc98aa2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SectionCard.jsx:resizeMouseMove',message:'Resize move',data:{dx,dy,handle:resizeHandle},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'I,J'})}).catch(()=>{});
      // #endregion
      
      let newBounds = { ...start };

      // Calculate new bounds based on which handle is being dragged
      switch (resizeHandle) {
        case 'se': // Southeast (bottom-right)
          newBounds.width = Math.max(MIN_SECTION_WIDTH, start.width + dx);
          newBounds.height = Math.max(MIN_SECTION_HEIGHT, start.height + dy);
          break;
        case 'sw': // Southwest (bottom-left)
          newBounds.x = start.x + dx;
          newBounds.width = Math.max(MIN_SECTION_WIDTH, start.width - dx);
          newBounds.height = Math.max(MIN_SECTION_HEIGHT, start.height + dy);
          if (newBounds.width === MIN_SECTION_WIDTH) {
            newBounds.x = start.x + start.width - MIN_SECTION_WIDTH;
          }
          break;
        case 'ne': // Northeast (top-right)
          newBounds.y = start.y + dy;
          newBounds.width = Math.max(MIN_SECTION_WIDTH, start.width + dx);
          newBounds.height = Math.max(MIN_SECTION_HEIGHT, start.height - dy);
          if (newBounds.height === MIN_SECTION_HEIGHT) {
            newBounds.y = start.y + start.height - MIN_SECTION_HEIGHT;
          }
          break;
        case 'nw': // Northwest (top-left)
          newBounds.x = start.x + dx;
          newBounds.y = start.y + dy;
          newBounds.width = Math.max(MIN_SECTION_WIDTH, start.width - dx);
          newBounds.height = Math.max(MIN_SECTION_HEIGHT, start.height - dy);
          if (newBounds.width === MIN_SECTION_WIDTH) {
            newBounds.x = start.x + start.width - MIN_SECTION_WIDTH;
          }
          if (newBounds.height === MIN_SECTION_HEIGHT) {
            newBounds.y = start.y + start.height - MIN_SECTION_HEIGHT;
          }
          break;
        case 'n': // North (top)
          newBounds.y = start.y + dy;
          newBounds.height = Math.max(MIN_SECTION_HEIGHT, start.height - dy);
          if (newBounds.height === MIN_SECTION_HEIGHT) {
            newBounds.y = start.y + start.height - MIN_SECTION_HEIGHT;
          }
          break;
        case 's': // South (bottom)
          newBounds.height = Math.max(MIN_SECTION_HEIGHT, start.height + dy);
          break;
        case 'e': // East (right)
          newBounds.width = Math.max(MIN_SECTION_WIDTH, start.width + dx);
          break;
        case 'w': // West (left)
          newBounds.x = start.x + dx;
          newBounds.width = Math.max(MIN_SECTION_WIDTH, start.width - dx);
          if (newBounds.width === MIN_SECTION_WIDTH) {
            newBounds.x = start.x + start.width - MIN_SECTION_WIDTH;
          }
          break;
        default:
          break;
      }

      onUpdate(section.id, { bounds: newBounds });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      startBoundsRef.current = null;
      startMouseRef.current = null;
      
      if (onResizeEnd) {
        onResizeEnd(section.id);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeHandle, section.id, onUpdate, onResizeEnd]);

  // Handle drag start for the header
  const handleHeaderMouseDown = useCallback((e) => {
    if (isEditing) return;
    e.stopPropagation();
    
    if (onDragStart) {
      onDragStart(section.id, e);
    }
  }, [isEditing, onDragStart, section.id]);

  const bounds = section.bounds || { x: 0, y: 0, width: 300, height: 200 };
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/8297760a-d8b0-4708-b45f-d146dc98aa2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SectionCard.jsx:render',message:'Section rendering',data:{sectionId:section.id,isSelected,bounds},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
  // #endregion

  return (
    <div
      ref={sectionRef}
      className={`section-card ${isSelected ? 'selected' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        width: bounds.width,
        height: bounds.height,
        position: 'relative',
      }}
      onClick={handleClick}
    >
      {/* Section header with title */}
      <div 
        className="section-header"
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="section-name-input"
          />
        ) : (
          <span className="section-name">{name}</span>
        )}
        
        {isSelected && (
          <button
            className="section-delete-btn"
            onClick={handleDeleteClick}
            title="Delete section"
          >
            ×
          </button>
        )}
      </div>

      {/* Section body - the container area */}
      <div className="section-body" />

      {/* Resize handles - only show when selected */}
      {isSelected && (
        <>
          {/* Corner handles - use onMouseDownCapture to capture before PanZoom Element */}
          <div 
            className="resize-handle nw" 
            onMouseDownCapture={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div 
            className="resize-handle ne" 
            onMouseDownCapture={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div 
            className="resize-handle sw" 
            onMouseDownCapture={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div 
            className="resize-handle se" 
            onMouseDownCapture={(e) => handleResizeMouseDown(e, 'se')}
          />
          
          {/* Edge handles */}
          <div 
            className="resize-handle n" 
            onMouseDownCapture={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div 
            className="resize-handle s" 
            onMouseDownCapture={(e) => handleResizeMouseDown(e, 's')}
          />
          <div 
            className="resize-handle e" 
            onMouseDownCapture={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div 
            className="resize-handle w" 
            onMouseDownCapture={(e) => handleResizeMouseDown(e, 'w')}
          />
        </>
      )}
    </div>
  );
});

export default SectionCard;

