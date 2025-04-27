import React, { useState, useCallback, memo, useMemo } from 'react';
import Modal from './Modal';
import './TimeInputDialog.css';

const TimeInputDialog = memo(({ isOpen, onClose, onTimeSet, onStorageModeSelect }) => {
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [error, setError] = useState('');
  const [storageMode, setStorageMode] = useState(() => {
    const mode = localStorage.getItem('storageMode') || 'local';
    return mode;
  });

  const handleStorageModeSelect = useCallback((mode) => {
    if (mode === storageMode) return; // Prevent unnecessary updates
    setStorageMode(mode);
    onStorageModeSelect(mode);
  }, [storageMode, onStorageModeSelect]);

  const handleSubmit = useCallback(() => {
    if (!description.trim()) {
      setError('Please enter a project description');
      return;
    }

    // Convert empty strings to 0
    const hoursValue = hours === '' ? 0 : parseInt(hours, 10);
    const minutesValue = minutes === '' ? 0 : parseInt(minutes, 10);
    const secondsValue = seconds === '' ? 0 : parseInt(seconds, 10);

    // Check if at least one field has a non-zero value
    if (hoursValue === 0 && minutesValue === 0 && secondsValue === 0) {
      setError('Please specify at least one time unit');
      return;
    }

    const totalSeconds = (hoursValue * 3600) + (minutesValue * 60) + secondsValue;
    const startTime = Date.now();

    // Set the time settings
    onTimeSet({
      description: description.trim(),
      startTime,
      endTime: startTime + (totalSeconds * 1000),
      halfwayPoint: startTime + (totalSeconds * 500),
      duration: totalSeconds / 60 // Keep duration in minutes for compatibility
    });

    onClose();
  }, [description, hours, minutes, seconds, onTimeSet, onClose]);

  const handleInputChange = useCallback((setter) => (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setter(value);
      setError('');
    }
  }, []);

  const modalProps = useMemo(() => ({
    isOpen,
    onClose,
    title: "Set project details",
    preventBackdropClick: true,
    primaryButton: {
      label: "Start project",
      onClick: handleSubmit
    }
  }), [isOpen, onClose, handleSubmit]);

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
      <div className="input-container">
        <div>
          <label>Project description</label>
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
          <div className="storage-mode-selector">
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
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
});

TimeInputDialog.displayName = 'TimeInputDialog';

export default TimeInputDialog;