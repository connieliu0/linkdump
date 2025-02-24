import React, { useState } from 'react';

const TimeInputDialog = ({ onTimeSet }) => {
  const [seconds, setSeconds] = useState('60');

  const handleSubmit = () => {
    const timeInSeconds = parseInt(seconds, 10);
    const startTime = Date.now();
    const durationMs = timeInSeconds * 1000;
    
    onTimeSet({
      startTime,
      endTime: startTime + durationMs,
      halfwayPoint: startTime + (durationMs / 2),
      totalSeconds: timeInSeconds,
      duration: durationMs
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '300px'
      }}>
        <h2 style={{ marginBottom: '16px' }}>Set Time Limit</h2>
        <p style={{ marginBottom: '16px' }}>Enter time in seconds (for testing)</p>
        <input
          type="number"
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          min="1"
        />
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default TimeInputDialog;