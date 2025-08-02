export const formatTimeRemaining = (seconds) => {
  if (!seconds) return 'Loading...';
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''} left`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} left`;
  }
  return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} left`;
};

export const getTimePhase = (currentTime, startTime, halfwayPoint) => {
  if (!startTime || !halfwayPoint) return 'unknown';
  return currentTime < halfwayPoint ? 'early' : 'late';
};

export const getTimeMessage = (timePhase) => {
  switch (timePhase) {
    case 'early':
      return "the sun rises, grow your files";
    case 'late':
      return "the sun sets, process your files before full decay";
    default:
      return '';
  }
};

export const calculateTimeRemaining = (startTime, duration) => {
  if (!startTime || !duration) return 0;
  const now = Date.now();
  const expiryTime = startTime + (duration * 60 * 1000); // Convert minutes to milliseconds
  return Math.max(0, Math.floor((expiryTime - now) / 1000)); // Convert to seconds
}; 