import React, { useState } from 'react';
import Modal from './Modal';

const TimeInputDialog = ({ onTimeSet, isOpen, onClose }) => {
  const [days, setDays] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Clear any previous error
    setError('');

    // Convert empty strings to 0
    const daysValue = days === '' ? 0 : parseInt(days, 10);
    const minutesValue = minutes === '' ? 0 : parseInt(minutes, 10);
    const secondsValue = seconds === '' ? 0 : parseInt(seconds, 10);

    // Check if at least one field has a non-zero value
    if (daysValue === 0 && minutesValue === 0 && secondsValue === 0) {
      setError('Please specify at least one time unit');
      return;
    }

    const daysInSeconds = daysValue * 24 * 60 * 60;
    const minutesInSeconds = minutesValue * 60;
    const totalSeconds = daysInSeconds + minutesInSeconds + secondsValue;

    const startTime = Date.now();
    const durationMs = totalSeconds * 1000;
    
    onTimeSet({
      startTime,
      endTime: startTime + durationMs,
      halfwayPoint: startTime + (durationMs / 2),
      totalSeconds,
      duration: durationMs,
      description: description
    });
    onClose();
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) { // Only allow empty string or numbers
      setter(value);
      setError(''); // Clear error when user makes changes
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} preventBackdropClick>
      <h2>Set Project Details</h2>
      <div>
        <label>Project Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description"
          className="input-field"
        />
      </div>
      <div>
        <label>Duration</label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={days}
              onChange={handleInputChange(setDays)}
              className={`input-field ${error ? 'error' : ''}`}
              min="0"
              placeholder="0"
              style={{ marginBottom: '4px' }}
            />
            <label style={{ fontSize: '0.8em', color: '#666' }}>Days</label>
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={minutes}
              onChange={handleInputChange(setMinutes)}
              className={`input-field ${error ? 'error' : ''}`}
              min="0"
              placeholder="0"
              style={{ marginBottom: '4px' }}
            />
            <label style={{ fontSize: '0.8em', color: '#666' }}>Minutes</label>
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={seconds}
              onChange={handleInputChange(setSeconds)}
              className={`input-field ${error ? 'error' : ''}`}
              min="0"
              placeholder="0"
              style={{ marginBottom: '4px' }}
            />
            <label style={{ fontSize: '0.8em', color: '#666' }}>Seconds</label>
          </div>
        </div>
        {error && (
          <div style={{ 
            color: '#C45C3E', 
            fontSize: '0.85em', 
            marginTop: '4px',
            marginBottom: '8px'
          }}>
            {error}
          </div>
        )}
      </div>
      <div className="button-container">
        <button onClick={handleSubmit}>
          Start
        </button>
      </div>
    </Modal>
  );
};

export default TimeInputDialog;