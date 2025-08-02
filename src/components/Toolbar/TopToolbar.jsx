import React, { useState, useEffect } from 'react';
import RoadmapDialog from '../Dialog/RoadmapDialog';
import AddContentDialog from '../Dialog/AddContentDialog';
import ImportArenaDialog from '../Dialog/ImportArenaDialog';
import { formatTimeRemaining, getTimePhase, getTimeMessage } from '../../utils/timeFormatting';
import { AnimatePresence, motion } from 'framer-motion';

const TimeDisplay = ({ timeRemaining, timeSettings, projectDescription, onProjectDescriptionChange, isOnboardingBoard, hasEditedTime, canEditTime, onTimeSettingsUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isTimeEditing, setIsTimeEditing] = useState(false);
      const [timeEditValues, setTimeEditValues] = useState({ days: '', hours: '', minutes: '' });
    const [timeEditError, setTimeEditError] = useState('');
  const [tooltipDismissed, setTooltipDismissed] = useState(() => {
    // Check if user has already dismissed the tooltip
    return localStorage.getItem('timeTooltipDismissed') === 'true';
  });

  const getMessage = () => {
    if (!timeSettings) return '';
    const now = Date.now();
    const timePhase = getTimePhase(now, timeSettings.startTime, timeSettings.halfwayPoint);
    return getTimeMessage(timePhase);
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

  // Determine tooltip text and styling
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);
  const timeDisplayCursor = canEditTime ? 'pointer' : 'default';
  
  const getTooltipText = () => {
    if (hasEditedTime) {
      return "Time has already been edited, you cannot change it";
    }
    if (isOnboardingBoard && canEditTime && !tooltipDismissed) {
      return "You can change the amount of time left once per project.";
    }
    return null;
  };
  
  const handleTimeHover = () => {
    if (isOnboardingBoard && canEditTime && !tooltipDismissed) {
      // Permanently dismiss the tooltip on first hover
      setTooltipDismissed(true);
      localStorage.setItem('timeTooltipDismissed', 'true');
    }
  };

  const handleTimeClick = () => {
    if (canEditTime && !isTimeEditing && !isEditing) {
      setIsTimeEditing(true);
      // Convert current duration from minutes to days, hours, minutes
      const totalMinutes = timeSettings.duration;
      const days = Math.floor(totalMinutes / (24 * 60));
      const remainingMinutes = totalMinutes % (24 * 60);
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      
      setTimeEditValues({
        days: days.toString(),
        hours: hours.toString(),
        minutes: minutes.toString()
      });
      setTimeEditError('');
    }
  };

  const validateTimeInput = (values) => {
    const days = parseInt(values.days) || 0;
    const hours = parseInt(values.hours) || 0;
    const minutes = parseInt(values.minutes) || 0;
    
    if (days < 0 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return 'Invalid time values';
    }
    if (days > 365) {
      return 'Duration cannot exceed 365 days';
    }
    // Allow zero values but ensure at least 1 minute total duration
    const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;
    if (totalMinutes === 0) {
      return 'Duration must be at least 1 minute';
    }
    return '';
  };

  const handleTimeSubmit = async (e) => {
    e.preventDefault();
    const error = validateTimeInput(timeEditValues);
    if (error) {
      setTimeEditError(error);
      return;
    }

    const days = parseInt(timeEditValues.days) || 0;
    const hours = parseInt(timeEditValues.hours) || 0;
    const minutes = parseInt(timeEditValues.minutes) || 0;
    
    // Ensure at least 1 minute duration
    const newDurationMinutes = Math.max(1, (days * 24 * 60) + (hours * 60) + minutes);
    
    try {
      // Update time settings
      const updatedSettings = {
        ...timeSettings,
        duration: newDurationMinutes,
        endTime: timeSettings.startTime + (newDurationMinutes * 60 * 1000),
        halfwayPoint: timeSettings.startTime + (newDurationMinutes * 30 * 1000),
        hasEditedTime: true
      };
      
      if (onTimeSettingsUpdate) {
        await onTimeSettingsUpdate(updatedSettings);
      }
      
      setIsTimeEditing(false);
      setTimeEditError('');
    } catch (error) {
      setTimeEditError('Failed to update time settings');
    }
  };

  const handleTimeCancel = () => {
    setIsTimeEditing(false);
    setTimeEditValues({ days: '', hours: '', minutes: '' });
    setTimeEditError('');
  };

  const handleTimeKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleTimeCancel();
    }
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
              placeholder="Project Name here"
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
              {projectDescription || 'Project Name here'}
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
      <div className="time-display-container">
        {isTimeEditing ? (
          <form onSubmit={handleTimeSubmit} className="time-edit-form">
            <div className="time-edit-input-container">
              <input
                type="number"
                value={timeEditValues.days}
                onChange={(e) => {
                  setTimeEditValues(prev => ({ ...prev, days: e.target.value }));
                  setTimeEditError('');
                }}
                onKeyDown={handleTimeKeyDown}
                min="0"
                max="365"
                className="time-edit-input"
                placeholder="0"
                autoFocus
              />
              <span className="time-edit-unit">d</span>
              <input
                type="number"
                value={timeEditValues.hours}
                onChange={(e) => {
                  const val = Math.min(23, parseInt(e.target.value) || 0);
                  setTimeEditValues(prev => ({ ...prev, hours: val.toString() }));
                  setTimeEditError('');
                }}
                onKeyDown={handleTimeKeyDown}
                min="0"
                max="23"
                className="time-edit-input"
                placeholder="0"
              />
              <span className="time-edit-unit">h</span>
              <input
                type="number"
                value={timeEditValues.minutes}
                onChange={(e) => {
                  const val = Math.min(59, parseInt(e.target.value) || 0);
                  setTimeEditValues(prev => ({ ...prev, minutes: val.toString() }));
                  setTimeEditError('');
                }}
                onKeyDown={handleTimeKeyDown}
                min="0"
                max="59"
                className="time-edit-input"
                placeholder="0"
              />
              <span className="time-edit-unit">m</span>
              <button type="submit" className="time-edit-save" title="Save changes">✓</button>
            </div>
            {timeEditError && (
              <div className="time-edit-error">{timeEditError}</div>
            )}
          </form>
        ) : (
          <div 
            className={`time-remaining-display ${canEditTime ? 'editable' : ''}`}
            style={{ cursor: timeDisplayCursor }}
            onMouseEnter={() => {
              handleTimeHover();
              setShowTimeTooltip(true);
            }}
            onMouseLeave={() => setShowTimeTooltip(false)}
            onClick={handleTimeClick}
          >
            {formatTimeRemaining(timeRemaining)}<span style={{color: 'var(--secondary-color)'}}> until full decay</span>
          </div>
        )}
        {showTimeTooltip && !isTimeEditing && getTooltipText() && (
          <div className="time-edit-tooltip">
            {getTooltipText()}
          </div>
        )}
      </div>
    </div>
  );
};


const MoreMenu = ({ onClearCanvas, onShowRoadmap, onConvertToCollaborative, storageMode }) => {
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
            <button onClick={onShowRoadmap}>Roadmap</button>
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
  onTimeSettingsUpdate,
  onConvertToCollaborative,
  storageMode,
  isOnboardingBoard,
  hasEditedTime,
  canEditTime,
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
          onTimeSettingsUpdate={onTimeSettingsUpdate}
          isOnboardingBoard={isOnboardingBoard}
          hasEditedTime={hasEditedTime}
          canEditTime={canEditTime}
        />
        <MoreMenu 
          onClearCanvas={handleClear}
          onShowRoadmap={() => setShowRoadmap(true)}
          onConvertToCollaborative={onConvertToCollaborative}
          storageMode={storageMode}
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