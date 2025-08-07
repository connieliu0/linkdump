import { useRef, useCallback } from 'react';

export const useDrag = ({ onDragStart, onDragEnd, disabled = false }) => {
  const isDraggingRef = useRef(false);
  const dragPositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef();
  const elementRef = useRef();

  const handleMouseDown = useCallback((e, initialPosition) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragPositionRef.current = { ...initialPosition };
    
    // Call onDragStart if provided
    if (onDragStart) {
      onDragStart();
    }
    
    // Get the workspace content element for coordinate calculations
    const workspaceContent = document.querySelector('.workspace-content');
    if (!workspaceContent) {
      console.warn('Workspace content not found, using simple drag mode');
      // Simple fallback drag
      const startX = e.clientX - initialPosition.x;
      const startY = e.clientY - initialPosition.y;
      
      const handleMouseMove = (e) => {
        if (!isDraggingRef.current) return;
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          dragPositionRef.current = {
            x: e.clientX - startX,
            y: e.clientY - startY
          };
          
          if (elementRef.current) {
            elementRef.current.style.left = `${dragPositionRef.current.x}px`;
            elementRef.current.style.top = `${dragPositionRef.current.y}px`;
          }
        });
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        if (onDragEnd) {
          onDragEnd(dragPositionRef.current);
        }
        document.removeEventListener('mousemove', handleMouseMove, { passive: true });
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      return;
    }
    
    // Get transform values from the workspace content
    const rect = workspaceContent.getBoundingClientRect();
    const transform = workspaceContent.style.transform;
    
    // Parse transform values
    let transformX = 0, transformY = 0, transformScale = 1;
    const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    
    if (translateMatch) {
      transformX = parseFloat(translateMatch[1]);
      transformY = parseFloat(translateMatch[2]);
    }
    if (scaleMatch) {
      transformScale = parseFloat(scaleMatch[1]);
    }
    
    // Calculate offset in workspace coordinates
    const startX = (e.clientX - rect.left - transformX) / transformScale;
    const startY = (e.clientY - rect.top - transformY) / transformScale;
    const offsetX = startX - initialPosition.x;
    const offsetY = startY - initialPosition.y;

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        // Get current transform values (they might change during pan/zoom)
        const currentRect = workspaceContent.getBoundingClientRect();
        const currentTransform = workspaceContent.style.transform;
        
        let currentX = 0, currentY = 0, currentScale = 1;
        const currentTranslateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        const currentScaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
        
        if (currentTranslateMatch) {
          currentX = parseFloat(currentTranslateMatch[1]);
          currentY = parseFloat(currentTranslateMatch[2]);
        }
        if (currentScaleMatch) {
          currentScale = parseFloat(currentScaleMatch[1]);
        }
        
        const mouseX = (e.clientX - currentRect.left - currentX) / currentScale;
        const mouseY = (e.clientY - currentRect.top - currentY) / currentScale;
        
        dragPositionRef.current = {
          x: mouseX - offsetX,
          y: mouseY - offsetY
        };
        
        if (elementRef.current) {
          elementRef.current.style.left = `${dragPositionRef.current.x}px`;
          elementRef.current.style.top = `${dragPositionRef.current.y}px`;
        }
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      
      if (onDragEnd) {
        onDragEnd(dragPositionRef.current);
      }
      
      document.removeEventListener('mousemove', handleMouseMove, { passive: true });
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
  }, [onDragStart, onDragEnd, disabled]);

  return { handleMouseDown, elementRef };
}; 