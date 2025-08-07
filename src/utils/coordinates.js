export const createCoordinateSystem = (canvasRef, transform) => {
  const screenToCanvas = (screenX, screenY) => {
    if (!canvasRef.current) return { x: screenX, y: screenY };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (screenX - rect.left - transform.x) / transform.scale;
    const canvasY = (screenY - rect.top - transform.y) / transform.scale;
    

    
    return { x: canvasX, y: canvasY };
  };

  const canvasToScreen = (canvasX, canvasY) => {
    if (!canvasRef.current) return { x: canvasX, y: canvasY };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = canvasX * transform.scale + transform.x + rect.left;
    const screenY = canvasY * transform.scale + transform.y + rect.top;
    
    return { x: screenX, y: screenY };
  };

  return { screenToCanvas, canvasToScreen };
}; 