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
      
      // Process text and links for CSV export
      const textAndLinks = itemsOnCanvas.filter(item => 
        item.type === 'text' || item.type === 'link'
      );
      
      if (textAndLinks.length > 0) {
        const csvContent = generateCSV(textAndLinks);
        zip.file('clipboard_content.csv', csvContent);
      }

      // Process images
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
  let csvContent = 'Type,Content,X,Y\n';
  
  sortedItems.forEach(item => {
    const type = item.type;
    const content = item.content.replace(/"/g, '""'); // Escape quotes
    const x = item.position?.x || 0;
    const y = item.position?.y || 0;
    
    csvContent += `"${type}","${content}",${x},${y}\n`;
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