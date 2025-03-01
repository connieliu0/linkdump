import React, { createContext, useState } from 'react';

export const TimeContext = createContext();

export const TimeProvider = ({ children }) => {
  const [timeSettings, setTimeSettings] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  // Time management logic here
  
  return (
    <TimeContext.Provider value={{ 
      timeSettings, 
      isExpired, 
      timeRemaining, 
      setTimeSettings 
    }}>
      {children}
    </TimeContext.Provider>
  );
}; 