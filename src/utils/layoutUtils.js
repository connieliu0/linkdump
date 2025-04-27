// src/utils/layoutUtils.js

/**
 * Arranges items in a grid layout to avoid overlaps
 * @param {Array} items - Array of items to position
 * @param {Object} options - Layout options
 * @returns {Array} - Items with calculated positions
 */
const layoutArenaItems = (items, options = {}) => {
  if (!items || !Array.isArray(items)) return [];
  
  const {
    startX = 50,
    startY = 50,
    padding = 30,
    columnWidth = 250,
    maxColumns = 5
  } = options;
  
  // Make a copy to avoid modifying the original items
  const positionedItems = [...items];
  
  // Calculate positions in a grid layout
  let column = 0;
  let row = 0;
  let maxHeightInRow = 0;
  
  positionedItems.forEach((item, index) => {
    // Estimate height based on content type
    let estimatedHeight = 100; // Default height
    
    if (item.type === 'image') {
      estimatedHeight = 180;
    } else if (item.type === 'text') {
      // Roughly estimate text height based on content length
      const contentLength = item.content?.length || 0;
      estimatedHeight = Math.max(80, Math.min(300, 80 + contentLength / 10));
    }
    
    // Calculate position
    const x = startX + (column * (columnWidth + padding));
    const y = startY + (row * (maxHeightInRow + padding));
    
    // Update item with position
    positionedItems[index] = {
      ...item,
      position: { x, y }
    };
    
    // Update maximum height in current row
    maxHeightInRow = Math.max(maxHeightInRow, estimatedHeight);
    
    // Move to next column or row
    column++;
    if (column >= maxColumns) {
      column = 0;
      row++;
      maxHeightInRow = 0;
    }
  });
  
  return positionedItems;
};

export { layoutArenaItems };