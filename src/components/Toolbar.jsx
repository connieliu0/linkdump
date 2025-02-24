import React from 'react';
import { sortElements, generateCSV, downloadCSV } from '../utils/export';
import { useExport } from '../hooks/useExport';

const Toolbar = ({ panzoomRef, timeRemaining, timeSettings }) => {
    const handleExport = useExport(panzoomRef);

    const getMessage = () => {
        if (!timeSettings) return '';
        
        const now = Date.now();
        const isBeforeHalfway = now < timeSettings.halfwayPoint;
        
        return isBeforeHalfway 
            ? "The sun is shining, grow your files"
            : "The sun is setting, process your files before they decay";
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
      <div style={{ color: '#4B5563', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span>{getMessage()}</span>
        <span>{timeRemaining ? `${timeRemaining} seconds remaining` : 'Loading...'}</span>
      </div>
    </div>
  );
};


export default Toolbar;