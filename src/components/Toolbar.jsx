import React from 'react';
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
    <div className="toolbar">

      <div className="toolbar-text">
        <span>{getMessage()}</span>
        <span>{timeRemaining ? `${timeRemaining} seconds remaining` : 'Loading...'}</span>
      </div>
      <div className="toolbar-text">
      <span>{timeSettings?.description}</span>
      <button 
        onClick={handleExport}
        className="button"
        style={{ padding: '8px' }}
      >
        Export Content
      </button>
    </div>
    </div>

  );
};


export default Toolbar;