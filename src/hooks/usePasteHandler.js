export const usePasteHandler = (mousePosition, setItems) => {
  return useCallback(async (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const { x, y } = mousePosition;
    
    try {
      // Handle image paste
      const imageItem = [...clipboardData.items].find(
        item => item.type.indexOf('image') !== -1
      );
      if (imageItem) {
        // Image handling logic
        return;
      }
      // Text/link handling logic
    } catch (error) {
      // Error handling
    }
  }, [mousePosition, setItems]);
}; 