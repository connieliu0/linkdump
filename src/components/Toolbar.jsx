import React from 'react';
import { useExport } from '../hooks/useExport';
import { clearBoard } from '../utils/storage';

const ToolbarButton = ({ onClick, children }) => (
  <button 
    onClick={onClick}
    className="button"
    style={{ padding: '8px' }}
  >
    {children}
  </button>
);

const getMessage = (timeSettings) => {
  if (!timeSettings) return '';
  
  const now = Date.now();
  const isBeforeHalfway = now < timeSettings.halfwayPoint;
  
  return isBeforeHalfway 
    ? "The sun is shining, grow your files"
    : "The sun is setting, process your files before they decay";
};

const TimeDisplay = ({ timeRemaining, timeSettings }) => (
  <>
    <span>{getMessage(timeSettings)}</span>
    <span>
      {timeRemaining ? `${timeRemaining} seconds remaining` : 'Loading...'}
    </span>
  </>
);

const Toolbar = ({ 
  panzoomRef, 
  onExport, 
  timeRemaining,
  timeSettings,
  onAddEmptyCard,
  onClearCanvas
}) => {
  const handleExport = useExport(panzoomRef);

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      await clearBoard();
      onClearCanvas();
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-text">
        <TimeDisplay 
          timeRemaining={timeRemaining} 
          timeSettings={timeSettings} 
        />
      </div>
      <div className="toolbar-actions">
        <ToolbarButton onClick={handleExport}>
          Export Content
        </ToolbarButton>
        <ToolbarButton onClick={onAddEmptyCard}>
          Empty Card
        </ToolbarButton>
        <ToolbarButton onClick={handleClear} className="clear-button">
          Clear Canvas
        </ToolbarButton>
      </div>
    </div>
  );
};

export default Toolbar;