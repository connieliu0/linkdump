/**
 * Detects if the current device is a mobile device
 * @returns {boolean} true if mobile, false if desktop
 */
export const isMobileDevice = () => {
  // Check viewport width (common mobile breakpoint)
  if (window.innerWidth < 768) {
    return true;
  }
  
  // Check for touch capability
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // But also check if it's a large screen (tablets in landscape might be considered desktop)
    if (window.innerWidth >= 1024) {
      return false;
    }
    return true;
  }
  
  return false;
};


