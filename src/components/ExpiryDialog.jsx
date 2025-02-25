import React from 'react';
import { sortElements, generateCSV, downloadCSV } from '../utils/export';
import { useExport } from '../hooks/useExport';
import '../styles/components.css';

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
      className="dialog-overlay"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="dialog-content"
      >
        <h2 className="dialog-title">Time's Up!</h2>
        <p className="dialog-text">
          The sun has set, your work has decayed. If you'd like to save, you can always export your work for local storage, or start anew...
        </p>
        <div className="button-container">
          <button
            onClick={handleExport}
          >
            Export
          </button>
          <button
            onClick={handleRestartClick}
          >
            New Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiryDialog;