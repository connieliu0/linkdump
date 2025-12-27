// src/utils/timeFormatting.js

export const createDefaultTimeSettings = () => {
  const startTime = Date.now();
  const durationInMinutes = 7 * 24 * 60; // 7 days in minutes
  const durationInSeconds = durationInMinutes * 60;
  
  return {
    description: "Your first project (desktop view recommended)",
    startTime,
    endTime: startTime + (durationInSeconds * 1000),
    halfwayPoint: startTime + (durationInSeconds * 500),
    duration: durationInMinutes
  };
};

export const formatTimeRemaining = (seconds) => {
  if (seconds === null || seconds === undefined) return '';
  
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
};

export const getTimePhase = (timeSettings) => {
  if (!timeSettings) return null;
  
  const now = Date.now();
  const { startTime, halfwayPoint, endTime } = timeSettings;
  
  if (now < startTime) return 'not-started';
  if (now >= endTime) return 'expired';
  if (now >= halfwayPoint) return 'second-half';
  return 'first-half';
};

export const getTimeMessage = (timeSettings) => {
  if (!timeSettings) return '';
  
  const phase = getTimePhase(timeSettings);
  switch (phase) {
    case 'not-started':
      return 'Project not started yet';
    case 'first-half':
      return 'First half of project';
    case 'second-half':
      return 'Second half of project';
    case 'expired':
      return 'Project has expired';
    default:
      return '';
  }
};