import { db } from '../utils/storage';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// All the existing export.js content goes here
export const useExport = (panzoomRef) => {
  const handleExport = async () => {
    try {
      // Get all items from the database
      const allItems = await db.items.toArray();
      
      // Only export items that have a valid position
      const itemsOnCanvas = allItems.filter(item => 
        item.position && typeof item.position.x === 'number' && typeof item.position.y === 'number'
      );
      
      if (itemsOnCanvas.length === 0) {
        console.log('No items to export');
        return;
      }

      // Create a new zip file
      const zip = new JSZip();
      
      // Generate CSV for all items
      const csvContent = generateCSV(itemsOnCanvas);
      zip.file('content.csv', csvContent);

      // Still save image files separately
      const images = itemsOnCanvas.filter(item => item.type === 'image');
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageBlob = await dataURLToBlob(image.content);
        zip.file(`image_${i + 1}.jpg`, imageBlob);
      }
      
      // Generate and download zip
      const zipBlob = await zip.generateAsync({type: 'blob'});
      saveAs(zipBlob, `linkpile-export.zip`);
      
    } catch (error) {
      console.error('Error exporting content:', error);
    }
  };

  return handleExport;
};

// Helper function to convert data URL to blob
const dataURLToBlob = async (dataURL) => {
  return fetch(dataURL).then(res => res.blob());
};

// Helper function for CSV generation
const generateCSV = (items) => {
  const sortedItems = sortElements(items);
  let csvContent = 'Type,Content,Source\n';
  
  sortedItems.forEach(item => {
    const type = item.type;
    let content = '';
    let source = item.sourceUrl || '';

    // Handle different types of content
    switch(type) {
      case 'image':
        content = `image_${items.indexOf(item) + 1}.jpg`;
        break;
      case 'link':
      case 'pastedText':
      case 'newText':
        content = item.content.replace(/"/g, '""'); // Escape quotes
        break;
      default:
        content = '';
    }
    
    csvContent += `"${type}","${content}","${source}"\n`;
  });
  
  return csvContent;
};

// Helper function to sort elements
const sortElements = (elements) => {
  return [...elements].sort((a, b) => {
    if ((a.position?.y || 0) !== (b.position?.y || 0)) {
      return (a.position?.y || 0) - (b.position?.y || 0);
    }
    return (a.position?.x || 0) - (b.position?.x || 0);
  });
}; 