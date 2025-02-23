import React from 'react';
import { findLinkGroups, generateCSV, downloadCSV, visualizeGroups } from '../utils/export';
const testPanZoomElements = (panzoomRef) => {
  if (!panzoomRef.current) {
    console.log('PanZoom ref not available');
    return;
  }

  // Get all elements from PanZoom
  const elements = panzoomRef.current.getElements();
  console.log('Elements:', elements);

  // Convert elements map to array of entries
  const elementEntries = Object.entries(elements);
  
  // Test overlaps between all elements
  elementEntries.forEach(([id1, el1], i) => {
    console.log(`Element ${id1}:`, {
      position: { x: el1.x, y: el1.y },
      dimensions: {
        width: el1.width,
        height: el1.height
      }
    });

    // Check overlaps with other elements
    elementEntries.slice(i + 1).forEach(([id2, el2]) => {
      // Check if elements overlap
      const isOverlapping = !(
        el1.x + el1.width < el2.x ||
        el1.x > el2.x + el2.width ||
        el1.y + el1.height < el2.y ||
        el1.y > el2.y + el2.height
      );

      if (isOverlapping) {
        console.log(`Overlap found between elements ${id1} and ${id2}`);
      }
    });
  });
};
const Toolbar = ({ panzoomRef }) => {
  const handleExport = () => {
    if (!panzoomRef.current) return;
    const elements = document.querySelectorAll('.paste-item');
    if (!elements.length) return;
    
    const groups = findLinkGroups(Array.from(elements), panzoomRef.current);
    visualizeGroups(groups);
    
    const csv = generateCSV(groups);
    downloadCSV(csv);
  };
  const handleTest = () => {
    testPanZoomElements(panzoomRef);
  };
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      zIndex: 50,
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <button 
        onClick={handleExport}
        style={{
          background: '#3B82F6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Export Links
      </button>
      <button onClick={handleTest} style={{/*...*/}}>
  Test Elements
</button>
      <span style={{ color: '#4B5563' }}>14 days remaining</span>
    </div>
  );
};

export default Toolbar;