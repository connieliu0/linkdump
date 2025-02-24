import { sortElements, generateCSV, downloadCSV } from '../utils/export';

export const useExport = (panzoomRef) => {
  const handleExport = (e) => {
    // Stop propagation if event is provided
    if (e?.stopPropagation) {
      e.stopPropagation();
    }

    if (!panzoomRef.current) return;
    const elements = document.querySelectorAll('.paste-item');
    if (!elements.length) return;
    
    const sortedElements = sortElements(Array.from(elements), panzoomRef.current);
    const csv = generateCSV(sortedElements);
    downloadCSV(csv);
  };
  return handleExport;
};