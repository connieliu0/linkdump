import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Modal from './Modal';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { getStorageAdapter } from '../../utils/storage/StorageFactory';
import useMeasure from 'react-use-measure';

const STEPS = {
  ONBOARD: 0,
  TIME_INPUT: 1,
};

const MergedDialog = ({ isOpen, onClose, onTimeSet, onStorageModeSelect }) => {
  // Onboarding logic
  const [currentStep, setCurrentStep] = useState(STEPS.ONBOARD);
  const [ref, bounds] = useMeasure();
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (hasVisited) setCurrentStep(STEPS.TIME_INPUT);
  }, []);

  // Time input state (from TimeInputDialog)
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [days, setDays] = useState('');
  const [error, setError] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [storageMode, setStorageMode] = useState(() => {
    const mode = localStorage.getItem('storageMode') || 'local';
    return mode;
  });

  const handleStorageModeSelect = useCallback((mode) => {
    if (mode === storageMode) return;
    setStorageMode(mode);
    onStorageModeSelect(mode);
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
    const daysValue = days === '' ? 0 : parseInt(days, 10);
    const hoursValue = hours === '' ? 0 : parseInt(hours, 10);
    const minutesValue = minutes === '' ? 0 : parseInt(minutes, 10);
    const secondsValue = seconds === '' ? 0 : parseInt(seconds, 10);
    if (daysValue === 0 && hoursValue === 0 && minutesValue === 0 && secondsValue === 0) {
      setError('Please specify at least one time unit');
      return;
    }
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
    const totalSeconds = (daysValue * 86400) + (hoursValue * 3600) + (minutesValue * 60) + secondsValue;
    const startTime = Date.now();
    onTimeSet({
      description: description.trim(),
      startTime,
      endTime: startTime + (totalSeconds * 1000),
      halfwayPoint: startTime + (totalSeconds * 500),
      duration: totalSeconds / 60,
      urlBackhalf: boardId
    });
    localStorage.setItem('hasVisitedBefore', 'true');
    onClose();
  }, [description, days, hours, minutes, seconds, onTimeSet, onClose, customUrl, storageMode]);

  const storageModeButtons = useMemo(() => [
    {
      mode: 'local',
      label: '🖥️ Local Storage',
      description: 'Store data on this device only'
    },
    {
      mode: 'collaborative',
      label: '🌐 Collaborative',
      description: 'Share and collaborate in real-time'
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
          title: 'Set project details',
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
          <p>👋 Read more about the project <a href="https://decay.connie.surf" target="_blank" rel="noopener noreferrer">here</a></p>
        </div>
        <div className="step">
          <p>📋 Paste images, links, or text on the canvas</p>
        </div>
        <div className="step">
          <p>⌛ Your content will age and fade with time</p>
        </div>
        <div className="step">
          <p>✍️ Add your own notes with empty cards</p>
        </div>
        <div className="step">
          <p>⏰ If you leave, time will still pass</p>
        </div>
      </div>
    </div>
  );

  // Time input content
  const timeInputContent = (
    <div className="input-container">
      <div>
        <label>Project title</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          placeholder="Enter project description"
        />
      </div>
      <div>
        <label>Duration</label>
        <div className="duration-inputs">
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
        </div>
      </div>
      <div>
        <label>Storage Mode</label>
        <div className="storage-mode-selector" style={{ position: 'relative' }}>
          {storageModeButtons.map(({ mode, label, description }) => (
            <button
              key={mode}
              type="button"
              className={`mode-button ${storageMode === mode ? 'active' : ''}`}
              onClick={() => handleStorageModeSelect(mode)}
            >
              {label}
              <span className="mode-description">{description}</span>
            </button>
          ))}
          <AnimatePresence initial={false}>
            {storageMode === 'collaborative' && (
              <motion.div
                key="collaborative-input"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="collaborative-input"
                style={{ marginTop: 12 }}
              >
                <p>linkdump.connie.surf/</p>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter board URL"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
    <Modal isOpen={isOpen} onClose={onClose} title={stepMeta.title} primaryButton={stepMeta.primaryButton}>
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