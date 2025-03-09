import React, { useState } from 'react';
import Modal from './Modal';

const TimeInputDialog = ({ onTimeSet, isOpen, onClose }) => {
  const [seconds, setSeconds] = useState('60');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const timeInSeconds = parseInt(seconds, 10);
    const startTime = Date.now();
    const durationMs = timeInSeconds * 1000;
    
    onTimeSet({
      startTime,
      endTime: startTime + durationMs,
      halfwayPoint: startTime + (durationMs / 2),
      totalSeconds: timeInSeconds,
      duration: durationMs,
      description: description
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
        <label>Duration (in seconds)</label>
        <input
          type="number"
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          className="input-field"
          min="1"
        />
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