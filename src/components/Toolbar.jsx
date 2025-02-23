import React from 'react';
import { sortElements, generateCSV, downloadCSV } from '../utils/export';

const Toolbar = ({ panzoomRef }) => {
  const handleExport = () => {
    if (!panzoomRef.current) return;
    const elements = document.querySelectorAll('.paste-item');
    if (!elements.length) return;
    
    const sortedElements = sortElements(Array.from(elements), panzoomRef.current);
    const csv = generateCSV(sortedElements);
    downloadCSV(csv);
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
        Export Content
      </button>
      <span style={{ color: '#4B5563' }}>14 days remaining</span>
    </div>
  );
};

export default Toolbar;