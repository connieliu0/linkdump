// utils/export.js
export const sortElements = (elements, panzoom) => {
  const panzoomElements = panzoom.getElements();
  
  // Convert elements to array with their panzoom positions
  const elementEntries = Array.from(elements).map(element => {
    const id = element.getAttribute('id');
    const panzoomData = panzoomElements[id];
    return {
      domElement: element,
      id,
      ...panzoomData
    };
  });

  return elementEntries
    .sort((a, b) => {
      const verticalThreshold = 50;
      const verticalDiff = Math.abs(a.y - b.y);
      
      if (verticalDiff < verticalThreshold) {
        return a.x - b.x;
      }
      return a.y - b.y;
    })
    .map(entry => entry.domElement);
};

export const generateCSV = (elements) => {
  let csv = '';
  const processed = new Set(); // Track processed elements to avoid duplicates
  
  elements.forEach(element => {
    // Skip if we've already processed this element
    if (processed.has(element)) return;
    
    console.log('Processing element:', {
      id: element.id,
      classList: Array.from(element.classList),
      type: element.tagName,
      hasLink: !!element.querySelector('a'),
      hasText: !!element.querySelector('.text-content'),
      hasImage: !!element.querySelector('img')
    });

    // For text elements (look for div with text-content class)
    const textContent = element.querySelector('.text-content');
    if (textContent) {
      const text = textContent.textContent.trim();
      if (text) {
        csv += `TEXT,${text}\n`;
        processed.add(element);
        return;
      }
    }

    // For image elements
    const img = element.querySelector('img');
    if (img) {
      const src = img.src || '';
      const alt = img.alt || '';
      if (src) {
        csv += `IMAGE,${alt},${src}\n`;
        processed.add(element);
        return;
      }
    }

    // For link elements
    const link = element.querySelector('a');
    if (link) {
      const url = link.href || '';
      const title = element.querySelector('.link-title')?.textContent?.trim() || '';
      if (url) {
        csv += `LINK,${title},${url}\n`;
        processed.add(element);
        return;
      }
    }
  });
  
  console.log('Generated CSV:', csv);
  return csv;
};

export const downloadCSV = (csv, filename = 'export.csv') => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Update visualizeElements to show the order
export const visualizeElements = (elements) => {
  elements.forEach((element, index) => {
    element.style.outline = '2px solid blue';
    // Add a small number indicator
    const indicator = document.createElement('div');
    indicator.style.position = 'absolute';
    indicator.style.top = '-20px';
    indicator.style.left = '0';
    indicator.style.background = 'blue';
    indicator.style.color = 'white';
    indicator.style.padding = '2px 6px';
    indicator.style.borderRadius = '4px';
    indicator.style.fontSize = '12px';
    indicator.textContent = (index + 1).toString();
    element.style.position = 'relative';
    element.appendChild(indicator);
  });
};