import React, { createContext, useState, ReactNode } from 'react';
import { TimeSettings } from '../types';

interface TimeContextType {
  timeSettings: TimeSettings | null;
  isExpired: boolean;
  timeRemaining: number | null;
  setTimeSettings: (settings: TimeSettings) => void;
}

interface TimeProviderProps {
  children: ReactNode;
}

export const TimeContext = createContext<TimeContextType>({
  timeSettings: null,
  isExpired: false,
  timeRemaining: null,
  setTimeSettings: () => {},
});

export const TimeProvider: React.FC<TimeProviderProps> = ({ children }) => {
  const [timeSettings, setTimeSettings] = useState<TimeSettings | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

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