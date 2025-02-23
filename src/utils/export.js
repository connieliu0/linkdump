// utils/export.js
export const isOverlapping = (rect1, rect2) => {
  const padding = 5; // Small padding to detect "touching"
  return !(rect1.right + padding < rect2.left || 
           rect1.left > rect2.right + padding || 
           rect1.bottom + padding < rect2.top || 
           rect1.top > rect2.bottom + padding);
};

export const findLinkGroups = (elements, panzoom) => {
  const groups = [];
  const used = new Set();

  elements.forEach(element => {
    if (used.has(element)) return;
    
    const group = [element];
    used.add(element);

    let foundNew = true;
    while (foundNew) {
      foundNew = false;
      elements.forEach(other => {
        if (used.has(other)) return;
        
        // Get real-world coordinates accounting for panzoom
        const rect1 = element.getBoundingClientRect();
        const rect2 = other.getBoundingClientRect();
        const { x: x1, y: y1 } = panzoom.getPosition(rect1);
        const { x: x2, y: y2 } = panzoom.getPosition(rect2);

        const transformedRect1 = {
          ...rect1,
          left: x1,
          right: x1 + rect1.width,
          top: y1,
          bottom: y1 + rect1.height
        };

        const transformedRect2 = {
          ...rect2,
          left: x2,
          right: x2 + rect2.width,
          top: y2,
          bottom: y2 + rect2.height
        };

        if (isOverlapping(transformedRect1, transformedRect2)) {
          group.push(other);
          used.add(other);
          foundNew = true;
        }
      });
    }
    groups.push(group);
  });

  return groups;
};

export const generateCSV = (groups) => {
  let csv = '';
  console.log('Groups to process:', groups);
  
  groups.forEach((group, index) => {
    console.log(`Processing group ${index}:`, group);
    // Add content from this group
    group.forEach(element => {
      // For text elements, get the direct textContent
      if (element.classList.contains('text-content')) {
        const text = element.textContent;
        console.log('Found text element:', text);
        csv += `${text},\n`;
        console.log('Added text row:', text);
        return;
      }

      // For link elements, get title and URL
      const url = element.querySelector('a')?.href || '-';
      const title = element.querySelector('.link-title')?.textContent || '';
      if (title || url) {
        csv += `${title},${url}\n`;
        console.log('Added link row:', `${title},${url}`);
      }
    });
    
    // Add separator between groups (except for last group)
    if (index < groups.length - 1) {
      csv += '----,----\n';
      console.log('Added separator');
    }
  });
  
  console.log('Final CSV content:', csv);
  return csv;
};

export const downloadCSV = (csv, filename = 'links.csv') => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};