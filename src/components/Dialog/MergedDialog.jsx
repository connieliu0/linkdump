import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Modal from './Modal';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { getStorageAdapter } from '../../utils/storage/StorageFactory';
import useMeasure from 'react-use-measure';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../utils/storage/firebase';


const STEPS = {
  ONBOARD: 0,
  TIME_INPUT: 1,
};

const MergedDialog = ({ isOpen, onClose, onTimeSet, onStorageModeSelect, forceTimeInputStep = false, allowBackdropClick = false }) => {
  // Onboarding logic
  const [currentStep, setCurrentStep] = useState(forceTimeInputStep ? STEPS.TIME_INPUT : STEPS.ONBOARD);
  const [ref, bounds] = useMeasure();
  useEffect(() => {
    if (forceTimeInputStep) {
      setCurrentStep(STEPS.TIME_INPUT);
      return;
    }
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (hasVisited) setCurrentStep(STEPS.TIME_INPUT);
  }, [forceTimeInputStep]);

  // Time input state (from TimeInputDialog)
  const [description, setDescription] = useState('Untitled');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [days, setDays] = useState('');
  const [error, setError] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('month'); // 'month', 'day', 'hour', 'custom'
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [storageMode, setStorageMode] = useState(() => {
    const mode = localStorage.getItem('storageMode') || 'local';
    return mode;
  });

  const handleStorageModeSelect = useCallback((mode) => {
    if (mode === storageMode) return;
    setStorageMode(mode);
    onStorageModeSelect(mode);
    logEvent(analytics, 'storage_mode_selected', { mode });
  }, [storageMode, onStorageModeSelect]);

  const handleInputChange = useCallback((setter) => (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setter(value);
      setError('');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!description.trim()) {
      setError('Please enter a project description');
      return;
    }
    
    let totalSeconds;
    if (selectedDuration === 'custom') {
      const daysValue = days === '' ? 0 : parseInt(days, 10);
      const hoursValue = hours === '' ? 0 : parseInt(hours, 10);
      const minutesValue = minutes === '' ? 0 : parseInt(minutes, 10);
      const secondsValue = seconds === '' ? 0 : parseInt(seconds, 10);
      if (daysValue === 0 && hoursValue === 0 && minutesValue === 0 && secondsValue === 0) {
        setError('Please specify at least one time unit');
        return;
      }
      totalSeconds = (daysValue * 86400) + (hoursValue * 3600) + (minutesValue * 60) + secondsValue;
    } else {
      switch (selectedDuration) {
        case 'month':
          totalSeconds = 30 * 24 * 3600; // 30 days
          break;
        case 'day':
          totalSeconds = 24 * 3600; // 1 day
          break;
        case 'hour':
          totalSeconds = 3600; // 1 hour
          break;
        default:
          setError('Please select a duration');
          return;
      }
    }
    
    // If creating a collaborative board, handle it differently
    if (storageMode === 'collaborative') {
      let boardId;
      if (customUrl.trim()) {
        const sanitizedUrl = customUrl.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        try {
          const { adapter } = getStorageAdapter('collaborative');
          const isAvailable = await adapter.checkUrlAvailability(sanitizedUrl);
          if (!isAvailable) {
            setError('This URL is already taken. Please choose another.');
            return;
          }
          boardId = await adapter.generateBoardId(sanitizedUrl);
        } catch (error) {
          setError('Error creating board with custom URL. Please try again.');
          return;
        }
      } else {
        try {
          const { adapter } = getStorageAdapter('collaborative');
          boardId = await adapter.generateBoardId();
        } catch (error) {
          setError('Error creating board. Please try again.');
          return;
        }
      }
      
      const startTime = Date.now();
      const timeSettings = {
        description: description.trim(),
        startTime,
        endTime: startTime + (totalSeconds * 1000),
        halfwayPoint: startTime + (totalSeconds * 500),
        duration: totalSeconds / 60
      };
      
      // Save time settings to the new board
      const { adapter } = getStorageAdapter('collaborative', boardId);
      await adapter.saveTimeSettings(timeSettings);
      
      logEvent(analytics, 'project_started', {
        mode: storageMode,
        has_custom_url: !!customUrl.trim(),
        duration_minutes: totalSeconds / 60
      });
      
      // Show confirmation with new board URL
      const newBoardUrl = `${window.location.origin}/${boardId}`;
      const confirmed = window.confirm(
        `Your new collaborative board has been created!\n\n` +
        `Board URL: ${newBoardUrl}\n\n` +
        `Would you like to open it in a new tab?`
      );
      
      if (confirmed) {
        window.open(newBoardUrl, '_blank');
      }
      
      localStorage.setItem('hasVisitedBefore', 'true');
      onClose();
      return;
    }
    
    // For local boards, use the existing flow
    const startTime = Date.now();
    logEvent(analytics, 'project_started', {
      mode: storageMode,
      has_custom_url: !!customUrl.trim(),
     duration_minutes: totalSeconds / 60
    });
    onTimeSet({
      description: description.trim(),
      startTime,
      endTime: startTime + (totalSeconds * 1000),
      halfwayPoint: startTime + (totalSeconds * 500),
      duration: totalSeconds / 60,
      urlBackhalf: null
    });
    localStorage.setItem('hasVisitedBefore', 'true');
    onClose();
  }, [description, days, hours, minutes, seconds, onTimeSet, onClose, customUrl, storageMode, selectedDuration]);

  const CustomDurationInputs = useMemo(() => {
    return showCustomDuration ? (
      <AnimatePresence mode="wait">
        <motion.div
          key="custom-duration"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.35 }
          }}
          className="duration-inputs"
        >
          <div className="duration-input">
            <input
              type="text"
              value={days}
              onChange={handleInputChange(setDays)}
              className="input-field"
              placeholder="0"
            />
            <label className="duration-label">Days</label>
          </div>
          <div className="duration-input">
            <input
              type="text"
              value={hours}
              onChange={handleInputChange(setHours)}
              className="input-field"
              placeholder="0"
            />
            <label className="duration-label">Hours</label>
          </div>
          <div className="duration-input">
            <input
              type="text"
              value={minutes}
              onChange={handleInputChange(setMinutes)}
              className="input-field"
              placeholder="0"
            />
            <label className="duration-label">Minutes</label>
          </div>
          <div className="duration-input">
            <input
              type="text"
              value={seconds}
              onChange={handleInputChange(setSeconds)}
              className="input-field"
              placeholder="0"
            />
            <label className="duration-label">Seconds</label>
          </div>
        </motion.div>
      </AnimatePresence>
    ) : null;
  }, [showCustomDuration, days, hours, minutes, seconds, handleInputChange]);

  const CollaborativeInput = useMemo(() => {
    return storageMode === 'collaborative' ? (
      <AnimatePresence mode="wait">
        <motion.div
          key="collaborative-input"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.35 }
          }}
          className="collaborative-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%'
          }}
        >
          <p style={{ margin: 0 }}>linkdump.connie.surf/</p>
          <input
            type="text"
            className="input-field"
            placeholder="Enter board URL"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            style={{ margin: 0 }}
          />
        </motion.div>
      </AnimatePresence>
    ) : null;
  }, [storageMode, customUrl]);

  const storageModeButtons = useMemo(() => [
    {
      mode: 'local',
      label: '🖥️ Save Locally',
      description: 'Store data on this device only'
    },
    {
      mode: 'collaborative',
      label: '🌐 Collaborative Link',
      description: 'Share + collaborate in real-time'
    }
  ], []);

  // Titles and button labels for each step
  const stepMeta = useMemo(() => {
    switch (currentStep) {
      case STEPS.ONBOARD:
        return {
          title: 'Welcome to the Link Dump',
          primaryButton: {
            label: 'Begin',
            onClick: () => {
              setCurrentStep(STEPS.TIME_INPUT);
              localStorage.setItem('hasVisitedBefore', 'true');
            }
          }
        };
      case STEPS.TIME_INPUT:
        return {
          title: 'Create a new project 🍃',
          primaryButton: {
            label: 'Start project',
            onClick: handleSubmit
          }
        };
      default:
        return { title: '', primaryButton: null };
    }
  }, [currentStep, handleSubmit]);

  // Onboarding content
  const onboardingContent = (
    <div className="dialog-body">
      <div className="onboarding-steps">
      <div className="step">
          <p>📋 Paste images, links, or text on the canvas</p>
        </div>
        <div className="step">
          <p>🌟 Import and sort collection from Are.na</p>
        </div>
        <div className="step">
          <p>✍️ Add your own notes with empty cards</p>
        </div>
        <div className="step">
          <p>⏰ Your content fades as time passes</p>
        </div>
        <div className="step">
          <p>📖 Read more about the project <a href="https://decay.connie.surf" target="_blank" rel="noopener noreferrer">here</a></p>
        </div>
      </div>
    </div>
  );

  // Time input content
  const timeInputContent = (
    <div className="input-container">
      <div>
        <label>Set your intention</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          placeholder="Enter project description"
        />
      </div>
      <div>
        <label>Duration, a single...</label>
        <div className="duration-section">
          <div className="options-row">
            <button
              type="button"
              className={`mode-button ${selectedDuration === 'month' ? 'active' : ''}`}
              onClick={() => {
                setSelectedDuration('month');
                setShowCustomDuration(false);
              }}
              style={{ 
                flex: 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
             🪴 Month
            </button>
            <button
              type="button"
              className={`mode-button ${selectedDuration === 'day' ? 'active' : ''}`}
              onClick={() => {
                setSelectedDuration('day');
                setShowCustomDuration(false);
              }}
              style={{ 
                flex: 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              🌿 Day
            </button>
            <button
              type="button"
              className={`mode-button ${selectedDuration === 'hour' ? 'active' : ''}`}
              onClick={() => {
                setSelectedDuration('hour');
                setShowCustomDuration(false);
              }}
              style={{ 
                flex: 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              🌱 Hour
            </button>
            <button
              type="button"
              className={`mode-button ${selectedDuration === 'custom' ? 'active' : ''}`}
              onClick={() => {
                setSelectedDuration('custom');
                setShowCustomDuration(true);
              }}
              style={{ 
                flex: 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              🍀 Custom
            </button>
          </div>
          {CustomDurationInputs}
        </div>
      </div>
      <div>
        <label>Share + collaborate in real-time?</label>
        <div className="duration-section">
          <div className="options-row">
            {storageModeButtons.map(({ mode, label, description }) => (
              <button
                key={mode}
                type="button"
                className={`mode-button ${storageMode === mode ? 'active' : ''}`}
                onClick={() => handleStorageModeSelect(mode)}
                style={{ 
                  flex: 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {label}
                <span className="mode-description">{description}</span>
              </button>
            ))}
          </div>
          {CollaborativeInput}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );

  const content = useMemo(() => {
    switch (currentStep) {
      case STEPS.ONBOARD:
        return onboardingContent;
      case STEPS.TIME_INPUT:
        return timeInputContent;
      default:
        return null;
    }
  }, [currentStep, onboardingContent, timeInputContent]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={stepMeta.title} primaryButton={stepMeta.primaryButton} preventBackdropClick={!allowBackdropClick}>
      <MotionConfig transition={{ duration: 0.5, type: "spring", bounce: 0 }}>
        <motion.div
          animate={{ height: bounds.height > 0 ? bounds.height : 'auto' }}
          style={{ overflow: 'hidden' }}
        >
          <div ref={ref}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentStep}
                initial={{ x: "110%", opacity: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ x: "-110%", opacity: 0 }}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </Modal>
  );
};

export default MergedDialog; 