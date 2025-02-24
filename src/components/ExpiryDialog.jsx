import React from 'react';
import { sortElements, generateCSV, downloadCSV } from '../utils/export';
import { useExport } from '../hooks/useExport';

const ExpiryDialog = ({ onRestart, panzoomRef }) => {
const handleExport = useExport(panzoomRef);


  const handleRestartClick = (e) => {
    e.stopPropagation();
    onRestart();
  };

  const handleDialogClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      onClick={handleDialogClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '300px'
        }}
      >
        <h2 style={{ marginBottom: '16px' }}>Time's Up!</h2>
        <p style={{ marginBottom: '16px' }}>
          Your session has expired. Would you like to export your work or start a new session?
        </p>
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '48%'
            }}
          >
            Export
          </button>
          <button
            onClick={handleRestartClick}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '48%'
            }}
          >
            New Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiryDialog;