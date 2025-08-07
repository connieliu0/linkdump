import React, { useCallback, useRef, useState } from 'react';
import { useDrag } from '../hooks/useDrag';

const DraggableCard = React.memo(function DraggableCard({ 
  children, 
  position, 
  onPositionChange, 
  onDragStart,
  onDragEnd,
  disabled = false,
  className = '',
  ...props 
}) {
  const wasDraggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(() => {
    wasDraggedRef.current = true;
    setIsDragging(true);
    if (onDragStart) {
      onDragStart();
    }
  }, [onDragStart]);

  const handleDragEndCallback = useCallback((newPosition) => {
    setIsDragging(false);
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
    if (onDragEnd) {
      onDragEnd(wasDraggedRef.current);
    }
    // Reset drag flag after a short delay
    setTimeout(() => {
      wasDraggedRef.current = false;
    }, 100);
  }, [onPositionChange, onDragEnd]);

  const { handleMouseDown, elementRef } = useDrag({
    onDragStart: handleDragStart,
    onDragEnd: handleDragEndCallback,
    disabled
  });

  const handleMouseDownWrapper = useCallback((e) => {
    handleMouseDown(e, position || { x: 0, y: 0 });
  }, [handleMouseDown, position]);

  return (
    <div
      ref={elementRef}
      className={`draggable-card ${isDragging ? 'dragging' : ''} ${className}`}
      onMouseDown={handleMouseDownWrapper}
      style={{
        position: 'absolute',
        left: position?.x || 0,
        top: position?.y || 0,
        cursor: disabled ? 'default' : 'grab',
        userSelect: 'none',
        touchAction: 'none'
      }}
      {...props}
    >
      {children}
    </div>
  );
});

export default DraggableCard; 