import React, { useState, useEffect } from 'react';
import { useExport } from '../hooks/useExport';
import { clearBoard } from '../utils/storage';
import RoadmapDialog from './Dialog/RoadmapDialog';

const TimeDisplay = ({ timeRemaining, timeSettings }) => {
  const getMessage = () => {
    if (!timeSettings) return '';
    const now = Date.now();
    const isBeforeHalfway = now < timeSettings.halfwayPoint;
    return isBeforeHalfway 
      ? "The sun is shining, grow your files"
      : "The sun is setting, process your files before they decay";
  };

  const formatTimeRemaining = (seconds) => {
    if (!seconds) return 'Loading...';
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
  };

  return (
    <div className="toolbar-section time-section">
      <div>{getMessage()}</div>
      <div>{formatTimeRemaining(timeRemaining)}</div>
    </div>
  );
};

const ProjectSection = ({ projectDescription }) => (
  <div className="toolbar-section project-section">
    <div className="project-name">{projectDescription || 'Project Name here'}</div>
  </div>
);

const ActionsMenu = ({ onClearCanvas, onAddEmptyCard, onShowRoadmap, onOpenAddContentModal }) => {
  return (
    <div className="toolbar-section actions-section">
      <div className="actions-header">Actions</div>
      
      <div className="actions-menu">
      <button onClick={onOpenAddContentModal}>Add Content</button>

        <button onClick={onClearCanvas}>Clear canvas</button>
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLScCG7CZkm6JVju3iHANitU1XkBrLCMZC066pjQN_HCYSuBXmg/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button>Give feedback</button>
        </a>
        <button onClick={onShowRoadmap}>Roadmap</button>
      </div>
    </div>
  );
};

const Toolbar = ({ 
  timeRemaining,
  timeSettings,
  projectDescription,
  onAddEmptyCard,
  onClearCanvas,
  isExpired,
  onOpenAddContentModal
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  useEffect(() => {
    // Small delay to ensure the initial render is complete
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset roadmap dialog when timeSettings changes or when expired
  useEffect(() => {
    setShowRoadmap(false);
  }, [timeSettings, isExpired]);

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      await clearBoard();
      onClearCanvas();
    }
  };

  return (
    <>
      <div className={`toolbar ${isVisible ? 'visible' : ''}`}>
        <TimeDisplay 
          timeRemaining={timeRemaining} 
          timeSettings={timeSettings} 
        />
        <ProjectSection projectDescription={projectDescription} />
        <ActionsMenu 
          onClearCanvas={handleClear}
          onAddEmptyCard={onAddEmptyCard}
          onShowRoadmap={() => setShowRoadmap(true)}
          onOpenAddContentModal={onOpenAddContentModal}
        />
      </div>
      
      <RoadmapDialog 
        isOpen={showRoadmap} 
        onClose={() => setShowRoadmap(false)} 
      />
    </>
  );
};

export default Toolbar;