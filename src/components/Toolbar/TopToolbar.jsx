import React, { useState, useEffect } from 'react';
import ChangelogDialog from '../Dialog/ChangelogDialog';
import AddContentDialog from '../Dialog/AddContentDialog';
import ImportArenaDialog from '../Dialog/ImportArenaDialog';
import { formatTimeRemaining, getTimePhase, getTimeMessage } from '../../utils/timeFormatting';
import { AnimatePresence, motion } from 'framer-motion';

// Helper to check if user has seen the changelog
const CHANGELOG_VERSION = '1.0'; // Increment this when you want to show the changelog again
const hasSeenChangelog = () => {
  return localStorage.getItem('seenChangelogVersion') === CHANGELOG_VERSION;
};
const markChangelogSeen = () => {
  localStorage.setItem('seenChangelogVersion', CHANGELOG_VERSION);
};

const TimeDisplay = ({ timeRemaining, timeSettings, projectDescription, onProjectDescriptionChange, onCreateBoard, isLocalBoard, onConvertToCollaborative }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const getMessage = () => {
    if (!timeSettings) return '';
    const now = Date.now();
    const timePhase = getTimePhase(now, timeSettings.startTime, timeSettings.halfwayPoint);
    return getTimeMessage(timePhase);
  };

  const getDefaultTitle = () => {
    return isLocalBoard ? 'Untitled Local Storage Board' : 'Untitled Collaborative Board';
  };

  const adjustTextareaHeight = (textarea) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  const [inputWidth, setInputWidth] = useState('auto');

  const handleClick = () => {
    if (onProjectDescriptionChange) {
      const newValue = projectDescription || '';
      setEditValue(newValue);
      setIsEditing(true);
      // Measure the display text width
      const displayElement = document.querySelector('.project-name-display');
      if (displayElement) {
        const width = displayElement.getBoundingClientRect().width;
        setInputWidth(`${width}px`);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onProjectDescriptionChange) {
      onProjectDescriptionChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue('');
    }
  };

  const handleBlur = () => {
    if (editValue.trim() !== (projectDescription || '')) {
      if (onProjectDescriptionChange) {
        onProjectDescriptionChange(editValue.trim());
      }
    }
    setIsEditing(false);
  };

  return (
    <div className="toolbar-section time-section">
      <div className="project-name">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <textarea
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                adjustTextareaHeight(e.target);
              }}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                } else {
                  handleKeyDown(e);
                }
              }}
              autoFocus
              ref={(textarea) => {
                if (textarea) {
                  textarea.focus();
                  adjustTextareaHeight(textarea);
                }
              }}
              className="project-name-input"
              style={{ width: inputWidth }}
              placeholder={getDefaultTitle()}
              rows={1}
            />
          </form>
        ) : (
          <div className="project-name-container">
            <span 
              onClick={handleClick}
              className={`project-name-display ${onProjectDescriptionChange ? 'editable' : ''}`}
              title={onProjectDescriptionChange ? 'Click to edit' : ''}
            >
              {projectDescription || getDefaultTitle()}
            </span>
            {onProjectDescriptionChange && (
              <span className="edit-icon" onClick={handleClick}>
                ✎
              </span>
            )}
          </div>
        )}
        {/* <div><em>{getMessage()}</em></div> */}
      </div>
      <div>{formatTimeRemaining(timeRemaining)}<span style={{color: 'var(--secondary-color)'}}> until full decay</span></div>
      {onCreateBoard && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="clickable-div new-board" onClick={onCreateBoard} style={{ display: 'inline-block' }}>
            ➕ New board
          </div>
          {isLocalBoard && onConvertToCollaborative && (
            <div className="clickable-div new-board" onClick={onConvertToCollaborative} style={{ display: 'inline-block' }}>
              🔗 Make Collaborative
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const MoreMenu = ({ onClearCanvas, onShowChangelog, onConvertToCollaborative, storageMode }) => {
  const [open, setOpen] = useState(false);

  const variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className="toolbar-section more-section">
      <div className="more-header">
        <button onClick={() => setOpen(v => !v)}>
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                ⤫
              </motion.span>
            ) : (
              <motion.span
                key="question"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                ?
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="more-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLScCG7CZkm6JVju3iHANitU1XkBrLCMZC066pjQN_HCYSuBXmg/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button>Give feedback</button>
            </a>
            <button onClick={onShowChangelog}>What's new</button>
            <a 
              href="https://decay.connie.surf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button>About Link Dump</button>
            </a>            
            <button onClick={onClearCanvas}>Clear canvas</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Toolbar = ({ 
  timeRemaining,
  timeSettings,
  projectDescription,
  onClearCanvas,
  isExpired,
  onProjectDescriptionChange,
  onConvertToCollaborative,
  storageMode,
  onCreateBoard,
  boardId,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const hasShownInitialChangelog = React.useRef(false);

  // Check if we're on a local board (not collaborative)
  const isLocalBoard = storageMode === 'local' || !boardId;

  useEffect(() => {
    // Small delay to ensure the initial render is complete
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Show changelog on first visit after board has loaded
  useEffect(() => {
    if (timeSettings && !hasShownInitialChangelog.current && !hasSeenChangelog()) {
      hasShownInitialChangelog.current = true;
      // Delay showing changelog to ensure board is fully rendered
      setTimeout(() => {
        setShowChangelog(true);
      }, 500);
    }
  }, [timeSettings]);

  const handleCloseChangelog = () => {
    markChangelogSeen();
    setShowChangelog(false);
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      onClearCanvas();
    }
  };

  return (
    <>
      <div className={`toolbar top-toolbar${isVisible ? ' visible' : ''}`}>
        <TimeDisplay 
          timeRemaining={timeRemaining} 
          timeSettings={timeSettings} 
          projectDescription={projectDescription}
          onProjectDescriptionChange={onProjectDescriptionChange}
          onCreateBoard={onCreateBoard}
          isLocalBoard={isLocalBoard}
          onConvertToCollaborative={onConvertToCollaborative}
        />
        <MoreMenu 
          onClearCanvas={handleClear}
          onShowChangelog={() => setShowChangelog(true)}
          onConvertToCollaborative={onConvertToCollaborative}
          storageMode={storageMode}
        />
      </div>
      
      <ChangelogDialog 
        isOpen={showChangelog} 
        onClose={handleCloseChangelog} 
      />
     
    </>
  );
};

export default Toolbar;