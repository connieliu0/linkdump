import React, { useState } from 'react';

const TimeInputDialog = ({ onTimeSet }) => {
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
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <label>Set Project Details</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description"
          className="input-field"
        />
        <label>Enter time in seconds (for testing)</label>
        <input
          type="number"
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          className="input-field"
          min="1"
        />
        <button
          onClick={handleSubmit}
          className="button"
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default TimeInputDialog;