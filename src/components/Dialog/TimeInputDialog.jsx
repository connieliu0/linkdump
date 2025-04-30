import React, { useState, useCallback, memo, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import Modal from './Modal';
import { getStorageAdapter } from '../../utils/storage/StorageFactory';
import { motion, AnimatePresence } from "framer-motion";

function usePrevious(value) {
  const ref = useRef();
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function AnimatedHeight({ children, ...props }) {
  const ref = useRef();
  const [height, setHeight] = useState();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useLayoutEffect(() => {
    if (!ref.current) return;
    if (displayChildren !== children) {
      // Phase 1: measure old height
      const oldHeight = ref.current.getBoundingClientRect().height;
      setHeight(oldHeight);
      setIsAnimating(true);

      // Phase 2: after DOM update, update children, measure new height, animate
      requestAnimationFrame(() => {
        setDisplayChildren(children);
        requestAnimationFrame(() => {
          if (!ref.current) return;
          const newHeight = ref.current.getBoundingClientRect().height;
          setHeight(newHeight);

          // Phase 3: after animation, set height to 'auto'
          setTimeout(() => {
            setIsAnimating(false);
            setHeight(undefined);
          }, 300); // match transition duration
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  // On first mount, set height to 'auto'
  useLayoutEffect(() => {
    if (height === undefined && ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
      setTimeout(() => setIsAnimating(false), 0);
    }
  }, [height]);

  return (
    <motion.div
      animate={{ height: isAnimating ? height : "auto" }}
      style={{ overflow: "hidden" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      {...props}
    >
      <div ref={ref}>{displayChildren}</div>
    </motion.div>
  );
}

const TimeInputDialog = memo(({ isOpen, onClose, onTimeSet, onStorageModeSelect }) => {
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
    if (mode === storageMode) return; // Prevent unnecessary updates
    setStorageMode(mode);
    onStorageModeSelect(mode);
  }, [storageMode, onStorageModeSelect]);

  const handleSubmit = useCallback(async () => {
    if (!description.trim()) {
      setError('Please enter a project description');
      return;
    }

    // Convert empty strings to 0
    const daysValue = days === '' ? 0 : parseInt(days, 10);
    const hoursValue = hours === '' ? 0 : parseInt(hours, 10);
    const minutesValue = minutes === '' ? 0 : parseInt(minutes, 10);
    const secondsValue = seconds === '' ? 0 : parseInt(seconds, 10);

    // Check if at least one field has a non-zero value
    if (daysValue === 0 && hoursValue === 0 && minutesValue === 0 && secondsValue === 0) {
      setError('Please specify at least one time unit');
      return;
    }

    // Handle custom URL if provided
    let boardId;
    if (customUrl.trim()) {
      // Sanitize the custom URL
      const sanitizedUrl = customUrl.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      try {
        const { adapter } = getStorageAdapter('collaborative');
        // Check if sanitized URL is available
        const isAvailable = await adapter.checkUrlAvailability(sanitizedUrl);
        if (!isAvailable) {
          setError('This URL is already taken. Please choose another.');
          return;
        }
        // Use sanitized URL for the board
        boardId = await adapter.generateBoardId(sanitizedUrl);
      } catch (error) {
        setError('Error creating board with custom URL. Please try again.');
        return;
      }
    } else {
      // Generate random board ID
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

    // Set the time settings
    onTimeSet({
      description: description.trim(),
      startTime,
      endTime: startTime + (totalSeconds * 1000),
      halfwayPoint: startTime + (totalSeconds * 500),
      duration: totalSeconds / 60, // Keep duration in minutes for compatibility
      urlBackhalf: boardId // Add this to your time setting
    });

    onClose();
  }, [description, days, hours, minutes, seconds, onTimeSet, onClose, customUrl, storageMode]);

  const handleInputChange = useCallback((setter) => (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setter(value);
      setError('');
    }
  }, []);

  const modalProps = useMemo(() => ({
    errormsg: error,
    isOpen,
    onClose,
    title: "Set project details", 
    preventBackdropClick: true,
    primaryButton: {
      label: "Start project",
      onClick: handleSubmit
    }
  }), [isOpen, onClose, handleSubmit, error]); // Added error to dependency array

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

  return (
    <Modal {...modalProps}>
      <AnimatedHeight>
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
        </div>
      </AnimatedHeight>
    </Modal>
  );
});

TimeInputDialog.displayName = 'TimeInputDialog';

export default TimeInputDialog;