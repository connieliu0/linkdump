import React, { useState, useEffect } from 'react';
import { clearBoard } from '../utils/storage';
import RoadmapDialog from './Dialog/RoadmapDialog';
import AddContentDialog from './Dialog/AddContentDialog';
import ImportArenaDialog from './Dialog/ImportArenaDialog';
import { formatTimeRemaining, getTimePhase, getTimeMessage } from '../utils/timeFormatting';
import { useDialogState } from '../hooks/useDialogState';

const TimeDisplay = ({ timeRemaining, timeSettings }) => {
  const getMessage = () => {
    if (!timeSettings) return '';
    const now = Date.now();
    const timePhase = getTimePhase(now, timeSettings.startTime, timeSettings.halfwayPoint);
    return getTimeMessage(timePhase);
  };

  return (
    <div className="toolbar-section time-section">
      <div>{getMessage()}</div>
      <div>{formatTimeRemaining(timeRemaining)}</div>
    </div>
  );
};

const ProjectSection = ({ projectDescription }) => {
  return (
    <div className="toolbar-section project-section">
      <div className="project-name">{projectDescription || 'Project Name here'}</div>
    </div>
  );
};

const ShareSection = ({ boardId }) => {
  const [copied, setCopied] = useState(false);
  
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?board=${boardId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!boardId) return null;

  return (
    <div className="toolbar-section share-section">
      <button className="share-button" onClick={handleShare}>
        {copied ? '✓ Copied!' : 'Share Board'}
      </button>
    </div>
  );
};

const ActionsMenu = ({ onClearCanvas, onShowRoadmap, onOpenAddContentModal, onOpenImportArena }) => {
  return (
    <div className="toolbar-section actions-section">
      <div className="actions-header">Actions</div>
      <div className="actions-menu">
        <button onClick={onOpenAddContentModal}>Add Content</button>
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLScCG7CZkm6JVju3iHANitU1XkBrLCMZC066pjQN_HCYSuBXmg/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button>Give feedback</button>
        </a>
        <button onClick={onOpenImportArena}>Import Arena</button>
        <button onClick={onShowRoadmap}>Roadmap</button>
        <button onClick={onClearCanvas}>Clear canvas</button>
      </div>
    </div>
  );
};

const Toolbar = ({ 
  timeRemaining,
  timeSettings,
  projectDescription,
  onClearCanvas,
  isExpired,
  boardId,
  onAddEmptyCard,
  onImportArenaItems
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showImportArena, setShowImportArena] = useState(false);

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

  const handleAddContent = (content) => {
    if (content.type === 'text') {
      onAddEmptyCard({ content: content.content, type: 'newText', isEmpty: false });
    } else if (content.type === 'image') {
      onAddEmptyCard({ content: content.content, type: 'image' });
    }
  };

  const handleImportArena = (items) => {
    if (onImportArenaItems) {
      onImportArenaItems(items);
    }
    setShowImportArena(false);
  };

  return (
    <>
      <div className={`toolbar ${isVisible ? 'visible' : ''}`}>
        <TimeDisplay 
          timeRemaining={timeRemaining} 
          timeSettings={timeSettings} 
        />
        <ProjectSection projectDescription={projectDescription} />
        <ShareSection boardId={boardId} />
        <ActionsMenu 
          onClearCanvas={handleClear}
          onShowRoadmap={() => setShowRoadmap(true)}
          onOpenAddContentModal={() => setShowAddContentModal(true)}
          onOpenImportArena={() => setShowImportArena(true)}
        />
      </div>
      
      <RoadmapDialog 
        isOpen={showRoadmap} 
        onClose={() => setShowRoadmap(false)} 
      />
      <AddContentDialog 
        isOpen={showAddContentModal} 
        onClose={() => setShowAddContentModal(false)}
        onAddContent={handleAddContent}
      />
      <ImportArenaDialog
        isOpen={showImportArena}
        onClose={() => setShowImportArena(false)}
        onImport={handleImportArena}
      />
    </>
  );
};

export default Toolbar;