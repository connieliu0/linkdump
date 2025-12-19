import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { groupCardsBySections } from '../utils/sectionUtils';

// All the existing export.js content goes here
export const useExport = (storage) => {
  const handleExport = async () => {
    try {
      // Get all items and sections from the storage adapter
      const allItems = await storage.loadItems();
      const allSections = await storage.loadSections();
      
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
      
      // Generate CSV for all items with sections
      const csvContent = generateCSVWithSections(itemsOnCanvas, allSections);
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

// Helper function for CSV generation with sections
const generateCSVWithSections = (items, sections) => {
  // Group cards by sections
  const groupedCards = groupCardsBySections(items, sections);
  
  let csvContent = 'Section,Type,Content,Source\n';
  
  // Get section names in order (by their y position, then x)
  const sectionOrder = [...sections].sort((a, b) => {
    const yDiff = (a.bounds?.y || 0) - (b.bounds?.y || 0);
    if (yDiff !== 0) return yDiff;
    return (a.bounds?.x || 0) - (b.bounds?.x || 0);
  }).map(s => s.name);
  
  // Add ungrouped at the end
  sectionOrder.push('Ungrouped');
  
  // Track image index for file naming
  let imageIndex = 1;
  
  // Process each section in order
  for (const sectionName of sectionOrder) {
    const sectionItems = groupedCards[sectionName] || [];
    
    // Skip empty sections
    if (sectionItems.length === 0) continue;
    
    // Add section header row
    const escapedSectionName = sectionName.replace(/"/g, '""');
    csvContent += `"--- ${escapedSectionName} ---","","",""\n`;
    
    // Sort items within section
    const sortedItems = sortElements(sectionItems);
    
    // Add each item with section name
    sortedItems.forEach(item => {
      const type = item.type;
      let content = '';
      let source = item.sourceUrl || '';
      const section = sectionName === 'Ungrouped' ? '' : sectionName;

      // Handle different types of content
      switch(type) {
        case 'image':
          content = `image_${imageIndex}.jpg`;
          imageIndex++;
          break;
        case 'link':
        case 'pastedText':
        case 'newText':
          content = item.content.replace(/"/g, '""'); // Escape quotes
          break;
        default:
          content = '';
      }
      
      csvContent += `"${section}","${type}","${content}","${source}"\n`;
    });
  }
  
  return csvContent;
};

// Legacy function for backward compatibility (without sections)
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