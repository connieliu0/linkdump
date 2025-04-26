import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './TimeInputDialog.css';

const TimeInputDialog = ({ isOpen, onClose, onTimeSet, onStorageModeSelect }) => {
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [error, setError] = useState('');
  const [storageMode, setStorageMode] = useState(() => {
    // Try to restore storage mode from localStorage
    return localStorage.getItem('storageMode') || 'local';
  });

  // Initialize storage mode on mount
  useEffect(() => {
    onStorageModeSelect(storageMode);
  }, []);

  const handleStorageModeSelect = (mode) => {
    console.log('Selecting storage mode:', mode);
    setStorageMode(mode);
    onStorageModeSelect(mode);
  };

  const handleSubmit = () => {
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

    const totalMinutes = 
      (hoursValue * 60) + 
      minutesValue + 
      (secondsValue / 60);

    const startTime = Date.now();
    const halfwayPoint = startTime + ((totalMinutes * 60 * 1000) / 2);

    // Set the time settings
    onTimeSet({
      description: description.trim(),
      startTime,
      duration: totalMinutes,
      halfwayPoint
    });

    onClose();
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setter(value);
      setError('');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Set project details"
      preventBackdropClick={true}
      primaryButton={{
        label: "Start project",
        onClick: handleSubmit
      }}
    >
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
            <button
              type="button"
              className={`mode-button ${storageMode === 'local' ? 'active' : ''}`}
              onClick={() => handleStorageModeSelect('local')}
            >
              🖥️ Local Storage
              <span className="mode-description">Store data on this device only</span>
            </button>
            <button
              type="button"
              className={`mode-button ${storageMode === 'collaborative' ? 'active' : ''}`}
              onClick={() => handleStorageModeSelect('collaborative')}
            >
              🌐 Collaborative
              <span className="mode-description">Share and collaborate in real-time</span>
            </button>
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
};

export default TimeInputDialog;