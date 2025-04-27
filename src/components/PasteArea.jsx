// src/components/PasteArea.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PanZoom, { Element } from '@sasza/react-panzoom';
import { getStorageAdapter, getExistingBoardAdapter } from '../utils/storage/StorageFactory';
import LinkCard from './LinkCard';
import ImageCard from './ImageCard';
import Toolbar from './Toolbar';
import TimeInputDialog from './Dialog/TimeInputDialog';
import ExpiryDialog from './Dialog/ExpiryDialog';
import { useAgingEffect } from '../hooks/useAgingEffect';
import { usePaperAgingEffect } from '../hooks/usePaperAgingEffect';
import TextCard from './TextCard';
import InactivityOverlay from './InactivityOverlay';
import OnboardingDialog from './Dialog/OnboardingDialog';
import shadowSvg from '../assets/timepasses/shadow.svg';
import shadowSvg2 from '../assets/timepasses/shadow2.svg';
import { FirebaseAdapter } from '../utils/storage/FirebaseAdapter';
import CollaborativeLink from './CollaborativeLink';

const MAX_WIDTH = 300; // Maximum width for images
const COMPRESSION_QUALITY = 0.7; // 0 = max compression, 1 = max quality

const extractSourceFromHtml = (html) => {
  if (!html) return null;
  
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Try to find image source
    const img = tempDiv.querySelector('img');
    if (img) {
      return img.src || img.getAttribute('data-source');
    }
    
    // Try to find link source
    const link = tempDiv.querySelector('a');
    if (link) {
      return link.href;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting source from HTML:', error);
    return null;
  }
};

const detectImageSource = async (clipboardData, file) => {
  // Try methods in order of reliability
  const plainText = clipboardData.getData('text/plain');
  const htmlText = clipboardData.getData('text/html');
  
  // Only use plainText if it's a valid URL
  const isValidUrl = plainText && (plainText.startsWith('http://') || plainText.startsWith('https://'));
  
  const source = 
    (isValidUrl ? plainText : null) || // Only use if valid URL
    extractSourceFromHtml(htmlText) ||  // Try to get from HTML
    ''; // Default to empty string instead of baseURI
    
  // Don't return localhost or app URLs
  if (source.includes('localhost') || source.includes('127.0.0.1')) {
    return '';
  }
  
  return source;
};

const PasteArea = ({ onExport }) => {
  // Get boardId from URL if present
  const [storageMode, setStorageMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlBoardId = urlParams.get('board');
    // Only use collaborative mode if board ID is in URL
    return urlBoardId ? 'collaborative' : 'local';
  });

  const [boardId, setBoardId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('board') || null;
  });

  const [isTimeSettingsLoading, setIsTimeSettingsLoading] = useState(true);
  const [storage, setStorage] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const panzoomRef = useRef();
  const activeItemRef = useRef(null);
  const [timeSettings, setTimeSettings] = useState(null);
  const [isExpired, setIsExpired] = useState(() => {
    // Check if there's an expired state in localStorage
    const savedExpiredState = localStorage.getItem('expiredState');
    if (savedExpiredState) {
      const { isExpired, items, timeSettings } = JSON.parse(savedExpiredState);
      if (isExpired) {
        // We'll set these in useEffect to avoid state updates during render
        return true;
      }
    }
    return false;
  });
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isInputActive, setIsInputActive] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  let inactivityTimer = useRef(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(true);

  // Load expired state from localStorage
  useEffect(() => {
    const savedExpiredState = localStorage.getItem('expiredState');
    if (savedExpiredState) {
      const { isExpired: wasExpired, items: savedItems, timeSettings: savedSettings } = JSON.parse(savedExpiredState);
      if (wasExpired) {
        setItems(savedItems || []);
        setTimeSettings(savedSettings);
        setIsExpired(true);
        setShowTimeInput(false);
      }
    }
  }, []);

  // Save expired state to localStorage
  useEffect(() => {
    if (isExpired) {
      const stateToSave = {
        isExpired: true,
        items,
        timeSettings
      };
      localStorage.setItem('expiredState', JSON.stringify(stateToSave));
    }
  }, [isExpired, items, timeSettings]);

  // Initialize storage based on mode and boardId
  useEffect(() => {
    const initializeStorage = async () => {
      // Initialize storage adapter first
      const { adapter } = getStorageAdapter(storageMode, boardId);
      console.log('[Storage Init] Created new adapter:', adapter.constructor.name);
      setStorage(adapter);

      // Try to load existing time settings
      try {
        const existingSettings = await adapter.getTimeSettings();
        if (existingSettings) {
          console.log('[Storage Init] Found existing settings');
          // Check if the settings are still valid
          const now = Date.now();
          const expiryTime = existingSettings.startTime + (existingSettings.duration * 60 * 1000);
          
          if (now < expiryTime) {
            // Settings are still valid
            setTimeSettings(existingSettings);
            setShowTimeInput(false);
            setIsTimeSettingsLoading(false);
            return;
          } else {
            // Settings have expired, clear them
            await adapter.clearBoard();
          }
        }
      } catch (error) {
        console.error('[Storage Init] Error loading settings:', error);
      }

      // If we get here, either no settings exist or they've expired
      if (storageMode === 'collaborative' && boardId) {
        const { adapter: collabAdapter } = getExistingBoardAdapter(boardId);
        if (collabAdapter) {
          setStorage(collabAdapter);
          const settings = await collabAdapter.getTimeSettings();
          if (settings) {
            setTimeSettings(settings);
            setShowTimeInput(false);
          }
        }
      } else {
        // For local mode or no valid settings
        setTimeSettings(null);
        setShowTimeInput(true);
      }
      
      setIsTimeSettingsLoading(false);
    };

    setIsTimeSettingsLoading(true);
    initializeStorage();
  }, [storageMode, boardId]);

  const handleStorageModeChange = (mode, newBoardId = null) => {
    // Only update if the mode is actually different
    if (mode === storageMode) return;

    console.log('[Mode Change] Current:', storageMode, '-> New:', mode);
    console.log('[Mode Change] State:', { 
      timeSettings: !!timeSettings,
      showTimeInput,
      isTimeSettingsLoading
    });
    
    // For local mode, we don't need to clear boardId during time input
    if (mode === 'local' && timeSettings) {
      console.log('[Mode Change] Clearing boardId for local mode');
      setBoardId(null);
    }
    setStorageMode(mode);
    localStorage.setItem('storageMode', mode);
  };

  const handleTimeSet = async (settings) => {
    console.log('[Time Set] Initializing with mode:', storageMode);
    
    let currentStorage = storage;
    
    // Initialize storage adapter based on mode
    if (storageMode === 'collaborative') {
      const { adapter, boardId: newBoardId } = getStorageAdapter('collaborative');
      if (!adapter) {
        console.error('[Time Set] Failed to initialize collaborative adapter');
        return;
      }
      
      setBoardId(newBoardId);
      setStorage(adapter);
      currentStorage = adapter;
      
      // Update URL with new board ID
      const url = new URL(window.location.href);
      url.searchParams.set('board', newBoardId);
      window.history.replaceState({}, '', url);
    } else {
      // Initialize local storage adapter
      const { adapter } = getStorageAdapter('local');
      if (!adapter) {
        console.error('[Time Set] Failed to initialize local adapter');
        return;
      }
      
      setStorage(adapter);
      currentStorage = adapter;
      // Clear boardId for local mode
      setBoardId(null);
      
      // Remove board parameter from URL if it exists
      if (window.location.search.includes('board=')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('board');
        window.history.replaceState({}, '', url);
      }
    }

    // Verify we have a valid storage adapter before proceeding
    if (!currentStorage) {
      console.error('[Time Set] No storage adapter available');
      return;
    }

    try {
      console.log('[Time Set] Saving settings');
      // Ensure we have all the required fields
      const timeSettings = {
        description: settings.description,
        startTime: settings.startTime,
        duration: settings.duration,
        halfwayPoint: settings.halfwayPoint,
        endTime: settings.endTime
      };
      
      await currentStorage.saveTimeSettings(timeSettings);
      setTimeSettings(timeSettings);
      resetInactivityTimer();
    } catch (error) {
      console.error('[Time Set] Error saving settings:', error);
    }
  };

  const loadTimeSettings = async () => {
    console.log('Loading time settings with storage:', storage);
    setIsTimeSettingsLoading(true);
    if (storage) {
      try {
        const settings = await storage.getTimeSettings();
        console.log('Loaded time settings:', settings);
        if (settings) {
          setTimeSettings(settings);
          // Check if expired
          const now = Date.now();
          const expiryTime = settings.startTime + (settings.duration * 60 * 1000);
          setIsExpired(now >= expiryTime);
          // Reset inactivity timer when time settings are loaded
          resetInactivityTimer();
        }
      } catch (error) {
        console.error('Error loading time settings:', error);
      }
    }
    setIsTimeSettingsLoading(false);
  };

  // Load time settings when storage changes
  useEffect(() => {
    if (!storage) {
      setIsTimeSettingsLoading(false);
      return;
    }
    console.log('Loading time settings with storage:', storage.constructor.name);
    loadTimeSettings();
  }, [storage]);

  // Add aging effects
  useAgingEffect(timeSettings);
  usePaperAgingEffect(timeSettings);

  // Add effect to handle time settings expiry
  useEffect(() => {
    if (!timeSettings) return;

    const checkExpiry = () => {
      const now = Date.now();
      const expiryTime = timeSettings.startTime + (timeSettings.duration * 60 * 1000); // Convert minutes to milliseconds
      if (now >= expiryTime) {
        setIsExpired(true);
      } else {
        const remainingMs = expiryTime - now;
        setTimeRemaining(Math.floor(remainingMs / 1000)); // Convert to seconds for display
      }
    };

    const timer = setInterval(checkExpiry, 1000);
    checkExpiry(); // Check immediately

    return () => clearInterval(timer);
  }, [timeSettings]);

  // Define addEmptyCard function
  const addEmptyCard = async (position = { x: 100, y: 100 }) => {
    const cardPosition = position && typeof position === 'object' 
      ? { x: position.x || 100, y: position.y || 100 }
      : { x: 100, y: 100 };

    const newItem = {
      type: 'newText',
      content: '',
      position: cardPosition,
      sourceUrl: '',
      isEmpty: true,
      timestamp: Date.now()
    };

    try {
      const id = await storage.saveItem(newItem);
      setItems(prev => [...prev, { ...newItem, id }]);
    } catch (error) {
      console.error('Error adding empty card:', error);
    }
  };

  // Define addCard function
  const addCard = async (cardData) => {
    const id = await storage.saveItem(cardData);
    setItems(prev => [...prev, { ...cardData, id }]);
  };

  // Define updateCard function
  const updateCard = async (id, updates) => {
    await storage.updateItem(id, updates);
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  // Define deleteCard function
  const deleteCard = async (id) => {
    await storage.deleteItem(id);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Load items when storage is ready
  useEffect(() => {
    if (!storage) return;
    console.log('Setting up items loading with storage:', storage.constructor.name);

    // For collaborative mode, use realtime listener
    if (storageMode === 'collaborative' && storage instanceof FirebaseAdapter) {
      console.log('Setting up realtime listener for collaborative mode');
      const unsubscribe = storage.setupRealtimeListener((updatedItems) => {
        console.log('Realtime update received:', updatedItems);
        setItems(updatedItems || []);
      });
      
      // Cleanup listener on unmount or storage change
      return () => {
        console.log('Cleaning up realtime listener');
        unsubscribe();
      };
    } 
    // For local mode, just fetch once
    else {
      const fetchItems = async () => {
        try {
          const savedItems = await storage.loadItems();
          console.log('Loaded items for local mode:', savedItems);
          setItems(savedItems || []);
        } catch (error) {
          console.error('Error loading items:', error);
        }
      };
      fetchItems();
    }
  }, [storage, storageMode]);

  // Handle paste events
  const handlePaste = useCallback(async (e) => {
    if (!storage) return;
    if (document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.classList.contains('content-input')) {
      return;
    }

    e.preventDefault();
    const clipboardData = e.clipboardData;
    const { x, y } = mousePosition;
    
    try {
      const imageItem = [...clipboardData.items].find(
        item => item.type.indexOf('image') !== -1
      );
      
      if (imageItem) {
        const file = imageItem.getAsFile();
        const sourceUrl = await detectImageSource(clipboardData, file);
        
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions
          let newWidth = img.width;
          let newHeight = img.height;
          
          if (newWidth > MAX_WIDTH) {
            const ratio = MAX_WIDTH / newWidth;
            newWidth = MAX_WIDTH;
            newHeight = img.height * ratio;
          }
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          const dataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
          
          const newItem = {
            type: 'image',
            content: dataUrl,
            position: { x, y },
            sourceUrl,
            timestamp: Date.now()
          };
          
          const id = await storage.saveItem(newItem);
          setItems(prev => [...prev, { ...newItem, id }]);
        };
        
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        return;
      }

      const text = clipboardData.getData('text');
      if (text) {
        const isUrl = text.startsWith('http://') || text.startsWith('https://');
        const newItem = {
          type: isUrl ? 'link' : 'pastedText',
          content: text,
          position: { x, y },
          sourceUrl: '',
          timestamp: Date.now(),
          isEmpty: false
        };
        
        const id = await storage.saveItem(newItem);
        setItems(prev => [...prev, { ...newItem, id }]);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  }, [mousePosition, storage]);

  // Handle board restart
  const handleRestart = async () => {
    // Clear expired state from localStorage
    localStorage.removeItem('expiredState');
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('board');
    window.history.replaceState({}, '', url.pathname);
    
    // Reset storage mode to local for new session
    setStorageMode('local');
    setBoardId(null);
    
    if (storage) {
      await storage.clearBoard();
    }
    setTimeSettings(null);
    setIsExpired(false);
    setItems([]);

    // Show time input dialog for new session
    setShowTimeInput(true);
  };

  // Track mouse position relative to panzoom
  const handleMouseMove = (e) => {
    if (panzoomRef.current) {
      const { x, y } = panzoomRef.current.getPosition(e);
      setMousePosition({ x, y });
    }
  };

  const handleDelete = async (id) => {
    if (!storage) return;
    try {
      await deleteCard(id);
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !isInputActive) {
      handleDelete(selectedId);
    }
  };

  // Add selection mode effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey) setIsSelecting(true);
    };
    
    const handleKeyUp = (e) => {
      if (!e.shiftKey) setIsSelecting(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleInputActiveChange = (active) => {
    setIsInputActive(active);
  };

  const handleClearCanvas = () => {
    const elements = document.querySelectorAll('.paste-item');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('clear-animation');
        // Small delay to ensure transition class is applied first
        requestAnimationFrame(() => {
          el.classList.add('disappear');
        });
      }, index * 100);
    });

    setTimeout(() => {
      setItems([]);
    }, elements.length * 100 + 500);
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    if (timeSettings) {
      inactivityTimer.current = setTimeout(() => {
        setIsInactive(true);
      }, 180000); // 3 minutes
    }
  }, [timeSettings]);

  useEffect(() => {
    // Only set up inactivity tracking if we have timeSettings
    if (!timeSettings) {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      return;
    }

    // Set up event listeners for user activity
    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetInactivityTimer, timeSettings]);

  const handleDismissOverlay = () => {
    setIsInactive(false);
    resetInactivityTimer();
  };

  // Check for first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    console.log('Debug visibility:', {
      showOnboarding,
      showTimeInput,
      timeSettings,
      isTimeSettingsLoading,
      hasVisited
    });
    if (!hasVisited) {
      setShowOnboarding(true);
      setShowTimeInput(false);
    }
  }, [showOnboarding, showTimeInput, timeSettings, isTimeSettingsLoading]);

  // Initialize showTimeInput to true
  useEffect(() => {
    setShowTimeInput(true);
  }, []);

  useEffect(() => {
    // Add paste event listener to the window
    window.addEventListener('paste', handlePaste);
    
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <>
      {showOnboarding && (
        <OnboardingDialog 
          isOpen={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            setShowTimeInput(!isExpired); // Only show time input if not expired
            localStorage.setItem('hasVisitedBefore', 'true');
          }}
        />
      )}

      {!showOnboarding && showTimeInput && !timeSettings && !isTimeSettingsLoading && !isExpired && (
        <TimeInputDialog 
          isOpen={true}
          onClose={() => setShowTimeInput(false)}
          onTimeSet={(settings) => {
            console.log('Setting time settings:', settings);
            handleTimeSet(settings);
            setShowTimeInput(false);
          }}
          onStorageModeSelect={handleStorageModeChange}
        />
      )}

      {(timeSettings || isExpired) && (
        <>
          <InactivityOverlay 
            isVisible={isInactive} 
            onDismiss={handleDismissOverlay}
          />
          {storageMode === 'collaborative' && boardId && !isExpired && (
            <CollaborativeLink boardId={boardId} />
          )}
          <div 
            className="paste-container" 
            onKeyDown={handleKeyDown} 
            onMouseMove={handleMouseMove}
            tabIndex={0}
          >
            <div 
              className="leaf-shadows-container sway1"
              style={{
                backgroundImage: `url(${shadowSvg})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                rotate: '180deg',
              }}
            ></div>
            <div 
              className="leaf-shadows-container sway2"
              style={{
                backgroundImage: `url(${shadowSvg2})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                rotate: '180deg',
              }}
            ></div>
            <Toolbar 
              panzoomRef={panzoomRef} 
              onExport={onExport} 
              timeRemaining={timeRemaining}
              timeSettings={timeSettings}
              projectDescription={timeSettings?.description}
              onAddEmptyCard={addEmptyCard}
              onClearCanvas={handleClearCanvas}
              isExpired={isExpired}
            />
            <PanZoom 
              selecting={isSelecting}
              zoomInitial={1}
              zoomMin={0.9}
              zoomMax={3}
              ref={panzoomRef}
              className="canvas-area"
              style={{ width: '100%', height: '100%' }}
              onContainerClick={() => setSelectedId(null)}
              disabled={isInputActive || isExpired}
              containerClassNames={{
                outer: 'canvas-area',
                inner: 'canvas-area__in'
              }}
              onElementsChange={(element) => {
                if (!activeItemRef.current) return;
                const elementData = element[activeItemRef.current];
                if (elementData) {
                  updateCard(activeItemRef.current, { 
                    position: { x: elementData.x, y: elementData.y } 
                  });
                }
              }}
            >
              {!isExpired && (
                <div style={{ 
                  position: 'fixed', 
                  top: '1rem', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  color: 'black',
                  pointerEvents: 'none'
                }}>
                  Paste an image or link here; Hold down shift to drag and select multiple 
                </div>
              )}
              
              {items.map(item => (
                <Element
                  key={item.id}
                  id={item.id}
                  className={`paste-item ${selectedId === item.id ? 'selected' : ''}`}
                  onClick={(e) => {
                    if (!isExpired) {
                      setSelectedId(item.id);
                      activeItemRef.current = item.id;
                    }
                  }}
                  x={item.position?.x || 0}
                  y={item.position?.y || 0}
                >
                  {item.type === 'image' ? (
                    <ImageCard 
                      src={item.content} 
                      itemId={item.id}
                      sourceUrl={item.sourceUrl}
                    />
                  ) : item.type === 'link' ? (
                    <LinkCard 
                      url={item.content} 
                      itemId={item.id}
                      initialMetadata={item.metadata}
                    />
                  ) : item.type === 'pastedText' ? (
                    <TextCard
                      content={item.content}
                      itemId={item.id}
                      sourceUrl={item.sourceUrl}
                      isEmpty={false}
                      showSourceUrl={true}
                      onInputActiveChange={handleInputActiveChange}
                      type="pastedText"
                    />
                  ) : item.type === 'newText' ? (
                    <TextCard
                      content={item.content}
                      itemId={item.id}
                      isEmpty={item.isEmpty}
                      showSourceUrl={false}
                      onInputActiveChange={handleInputActiveChange}
                      type="newText"
                    />
                  ) : null}
                </Element>
              ))}
            </PanZoom>
          </div>
        </>
      )}

      {isTimeSettingsLoading && !isExpired && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Connecting to board... please wait</p>
          </div>
        </div>
      )}

      {isExpired && (
        <ExpiryDialog 
          isOpen={isExpired}
          panzoomRef={panzoomRef}
          onRestart={handleRestart} 
        />
      )}
    </>
  );
};

export default PasteArea;