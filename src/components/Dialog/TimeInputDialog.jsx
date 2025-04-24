import React, { useState } from 'react';
import Modal from './Modal';

const TimeInputDialog = ({ isOpen, onClose, onTimeSet }) => {
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [error, setError] = useState('');

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

    const totalMilliseconds = 
      (hoursValue * 60 * 60 * 1000) + 
      (minutesValue * 60 * 1000) + 
      (secondsValue * 1000);

    const startTime = Date.now();
    const endTime = startTime + totalMilliseconds;
    const halfwayPoint = startTime + (totalMilliseconds / 2); // Calculate halfway point

    onTimeSet({
      description: description.trim(),
      startTime,
      endTime,
      halfwayPoint,
      totalSeconds: totalMilliseconds / 1000, // Add total seconds
      duration: totalMilliseconds / (60 * 60 * 1000) // Convert to hours for consistency
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
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            width: '100%'
          }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={hours}
                onChange={handleInputChange(setHours)}
                className="input-field"
                placeholder="0"
              />
              <label style={{ fontSize: '0.8em', color: '#351C1C' }}>Hours</label>
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={minutes}
                onChange={handleInputChange(setMinutes)}
                className="input-field"
                placeholder="0"
              />
              <label style={{ fontSize: '0.8em', color: '#351C1C' }}>Minutes</label>
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={seconds}
                onChange={handleInputChange(setSeconds)}
                className="input-field"
                placeholder="0"
              />
              <label style={{ fontSize: '0.8em', color: '#351C1C' }}>Seconds</label>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ color: '#351C1C' }}>
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TimeInputDialog;