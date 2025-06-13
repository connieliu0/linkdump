// src/components/PasteArea.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PanZoom, { Element } from '@sasza/react-panzoom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorageAdapter } from '../utils/storage/StorageFactory';
import LinkCard from './LinkCard';
import ImageCard from './ImageCard';
import BottomToolbar from './Toolbar/BottomToolbar';
import TopToolbar from './Toolbar/TopToolbar';
import ExpiryDialog from './Dialog/ExpiryDialog';
import { useAgingEffect } from '../hooks/useAgingEffect';
import { usePaperAgingEffect } from '../hooks/usePaperAgingEffect';
import TextCard from './TextCard';
import InactivityOverlay from './InactivityOverlay';
import shadowSvg from '../assets/timepasses/shadow.svg';
import shadowSvg2 from '../assets/timepasses/shadow2.svg';
import { FirebaseAdapter } from '../utils/storage/FirebaseAdapter';
import { processImage, extractImageFromClipboard, handleImageFile } from '../utils/imageProcessing';
import { detectImageSource } from '../utils/linkProcessing';
import { createImageCard, createTextCard, createLinkCard } from '../utils/cardManagement';
import { saveAndUpdateItems, updateAndRefreshItems, deleteAndRemoveItem } from '../utils/storageOperations';
import { layoutArenaItems } from '../utils/layoutUtils';
import MergedDialog from './Dialog/MergedDialog';

// Helper to get/set visited boards
const getVisitedBoards = () => {
  try {
    return JSON.parse(localStorage.getItem('visitedBoards')) || [];
  } catch {
    return [];
  }
};

const addVisitedBoard = (boardId) => {
  const boards = getVisitedBoards();
  if (!boards.includes(boardId)) {
    boards.push(boardId);
    localStorage.setItem('visitedBoards', JSON.stringify(boards));
  }
};

const PasteArea = ({ onExport }) => {
  // Get boardId from URL if present and determine storage mode
  const [storageMode, setStorageMode] = useState(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const urlBoardId = pathParts[0] || null;
    
    // If there's a board ID in the URL, always use collaborative mode
    if (urlBoardId) {
      localStorage.setItem('storageMode', 'collaborative');
      return 'collaborative';
    }
    
    // If we're at the root URL, use the stored preference
    const storedMode = localStorage.getItem('storageMode');
    if (storedMode) {
      return storedMode;
    }
    
    // Default to local mode
    localStorage.setItem('storageMode', 'local');
    return 'local';
  });

  const [boardId, setBoardId] = useState(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    return pathParts[0] || null;
  });

  const [storage, setStorage] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const panzoomRef = useRef();
  const activeItemRef = useRef(null);
  const [timeSettings, setTimeSettings] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isInputActive, setIsInputActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  let inactivityTimer = useRef(null);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [loadingTimeSettings, setLoadingTimeSettings] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const wasDraggedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  const lastSelectedIdRef = useRef(null);

  // Add a ref to track if we're clearing
  const isClearingRef = useRef(false);

  // Initialize storage and load time settings
  useEffect(() => {
    let timeoutId;
    let isMounted = true;
    
    const loadInitialTimeSettings = async () => {
      try {
        // Get the storage adapter
        const { adapter } = getStorageAdapter(storageMode, boardId);
        
        if (adapter && isMounted) {
          const settings = await adapter.getTimeSettings();
          
          if (settings) {
            setTimeSettings(settings);
          } else {
            // Only show the time input dialog after a short delay
            // if no settings were found and we're not in collaborative mode
            timeoutId = setTimeout(() => {
              if (isMounted && !timeSettings) {
                const pathParts = window.location.pathname.split('/').filter(Boolean);
                const urlBoardId = pathParts[0] || null;
                // Only show time input if we're not in collaborative mode
                if (!urlBoardId) {
                  setShowTimeInput(true);
                }
                console.log('No time settings found after timeout');
              }
            }, 2000); // 2 second delay before showing time input
          }
        }
      } catch (error) {
        console.error('Error loading time settings:', error);
      }
    };
    
    loadInitialTimeSettings();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [storageMode, boardId]);

  // Initialize storage based on mode and boardId
  useEffect(() => {
    const initializeStorage = async () => {
      // If we're at the root URL and have local storage mode set
      if (window.location.pathname === '/' && storageMode === 'local') {
        const { adapter } = getStorageAdapter('local');
        setStorage(adapter);
        setBoardId(null);
        
        // Try to load existing time settings from IndexedDB
        try {
          const settings = await adapter.getTimeSettings();
          if (settings) {
            setTimeSettings(settings);
          }
        } catch (error) {
          console.error('Error loading local time settings:', error);
        }
        return;
      }

      // Handle collaborative mode
      if (storageMode === 'collaborative') {
        const { adapter, boardId: newBoardId } = getStorageAdapter('collaborative', boardId);
        setStorage(adapter);
        
        if (!newBoardId && adapter instanceof FirebaseAdapter) {
          try {
            const generatedBoardId = await adapter.generateBoardId();
            setBoardId(generatedBoardId);
            
            if (timeSettings) {
              const newPath = `/${generatedBoardId}`;
              window.history.replaceState({}, '', newPath);
            }
          } catch (error) {
            console.error('Error generating board ID:', error);
            return;
          }
        } else if (newBoardId) {
          setBoardId(newBoardId);
          
          if (timeSettings) {
            const newPath = `/${newBoardId}`;
            window.history.replaceState({}, '', newPath);
          }
        }

        // Set up realtime listener for collaborative mode
        const unsubscribe = adapter.setupRealtimeListener((items) => {
          if (isClearingRef.current) return;
          const validItems = items.filter(item => {
            if (!item?.id) {
              console.warn('Found item without ID:', item);
              return false;
            }
            return true;
          });
          setItems(validItems);
        });
        return () => unsubscribe();
      }
    };

    initializeStorage();
  }, [storageMode, boardId]);

  const handleStorageModeChange = (mode) => {
    // console.log('Handling storage mode change:', mode);
    setStorageMode(mode);
    localStorage.setItem('storageMode', mode);
    
    // Clear boardId and URL when switching to local mode
    if (mode === 'local') {
      setBoardId(null);
      window.history.replaceState({}, '', '/');
    }
  };

  const handleTimeSet = async (settings) => {
    // console.log('Handling time set:', settings);
    try {
      // Ensure we have all the required fields
      const timeSettings = {
        description: settings.description,
        startTime: settings.startTime,
        duration: settings.duration,
        halfwayPoint: settings.halfwayPoint
      };
      
      if (storageMode === 'collaborative') {
        // Handle collaborative mode
        if (settings.urlBackhalf) {
          const { adapter } = getStorageAdapter('collaborative');
          await adapter.generateBoardId(settings.urlBackhalf);
          
          setStorage(adapter);
          setBoardId(settings.urlBackhalf);
          
          // Update URL
          const newPath = `/${settings.urlBackhalf}`;
          window.history.replaceState({}, '', newPath);
          
          // Save time settings
          await adapter.saveTimeSettings(timeSettings);
        } else {
          const { adapter } = getStorageAdapter('collaborative');
          const newBoardId = await adapter.generateBoardId();
          
          setStorage(adapter);
          setBoardId(newBoardId);
          
          // Update URL
          const newPath = `/${newBoardId}`;
          window.history.replaceState({}, '', newPath);
          
          // Save time settings
          await adapter.saveTimeSettings(timeSettings);
        }
      } else {
        // Handle local mode
        const { adapter } = getStorageAdapter('local');
        setStorage(adapter);
        setBoardId(null);
        
        // Ensure we're at the root URL
        window.history.replaceState({}, '', '/');
        
        // Save time settings to IndexedDB
        await adapter.saveTimeSettings(timeSettings);
      }
      
      setTimeSettings(timeSettings);
      resetInactivityTimer();
    } catch (error) {
      // console.error('Error saving time settings:', error);
    }
  };

  const loadTimeSettings = async () => {
    if (storage) {
      try {
        const settings = await storage.getTimeSettings();
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
        // console.error('Error loading time settings:', error);
      }
    }
  };

  // Load time settings when storage changes
  const loadTimeSettingsRef = useRef(loadTimeSettings);
  useEffect(() => {
    loadTimeSettingsRef.current = loadTimeSettings;
  }, [loadTimeSettings]);

  useEffect(() => {
    if (!storage) return;
    loadTimeSettingsRef.current();
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
  const addEmptyCard = async (cardData = { position: { x: 100, y: 100 } }) => {
    try {
      const newItem = cardData.type === 'image' 
        ? createImageCard(cardData.content, cardData.position, cardData.sourceUrl)
        : createTextCard(cardData.content, cardData.position, cardData.isEmpty);
      await saveAndUpdateItems(storage, newItem, setItems);
    } catch (error) {
      console.error('Error adding empty card:', error);
    }
  };


  // Define updateCard function
  const updateCard = async (id, updates) => {
    // console.log('Updating card:', id, updates);
    try {
      await updateAndRefreshItems(storage, id, updates, setItems);
      // console.log('Card updated successfully');
    } catch (error) {
      // console.error('Error updating card:', error);
    }
  };

  // Define deleteCard function
  const deleteCard = async (id) => {
    await deleteAndRemoveItem(storage, id, setItems);
  };

  // Load items when storage is ready
  useEffect(() => {
    const fetchItems = async () => {
      if (!storage) return;
      // In collaborative mode, we need both storage and boardId
      if (storageMode === 'collaborative' && !boardId) return;
      
      try {
        const savedItems = await storage.loadItems();
        // console.log('Loaded items:', savedItems);
        setItems(savedItems || []);
      } catch (error) {
        // console.error('Error loading items:', error);
      }
    };
    fetchItems();
  }, [storage, boardId, storageMode]);

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
      // console.log('Clipboard items:', clipboardData.items);
      const imageItem = extractImageFromClipboard(clipboardData);
      // console.log('Extracted image item:', imageItem);
      
      if (imageItem) {
        const file = imageItem.getAsFile();
        // console.log('Clipboard file:', file);
        const reader = new FileReader();
        reader.onloadend = async () => {
          // console.log('Clipboard file data URL:', reader.result);
          try {
            const processedDataUrl = await processImage(reader.result);
            const newItem = createImageCard(processedDataUrl, { x, y }, imageItem.type === 'image' ? imageItem.sourceUrl : null);
            // console.log('New image card id:', newItem.id);
            await saveAndUpdateItems(storage, newItem, setItems);
          } catch (error) {
            // console.error('Error saving item:', error);
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      const text = clipboardData.getData('text');
      if (text) {
        const isUrl = /^(https?:\/\/[^\s]+)$/.test(text);
        const newItem = isUrl 
          ? createLinkCard(text, { x, y })
          : createTextCard(text, { x, y }, false);
        // console.log('New text/link card id:', newItem.id);
        await saveAndUpdateItems(storage, newItem, setItems);
      }
    } catch (error) {
      // console.error('Error saving item:', error);
    }
  }, [mousePosition, storage]);

  // Handle board restart
  const handleRestart = async () => {
    // console.log('[PasteArea] Starting board restart...');
    
    // Set clearing flag to prevent realtime updates
    isClearingRef.current = true;
    
    try {
      if (!storage) {
        // console.error('[PasteArea] No storage adapter available');
        return;
      }

      // For local mode, we need to clear the settings from IndexedDB
      if (storageMode === 'local') {
        // console.log('[PasteArea] Clearing local storage settings...');
        const success = await storage.clearBoard();
        
        if (!success) {
          // console.error('[PasteArea] Failed to clear local storage settings');
          return;
        }
        
        setTimeSettings(null);
        setIsExpired(false);
        setShowTimeInput(true);
      } else {
        // For collaborative mode, clear the entire board
        // console.log('[PasteArea] Clearing board in storage...');
        const success = await storage.clearBoard();
        
        if (!success) {
          // console.error('[PasteArea] Failed to clear board in storage');
          return;
        }
        
        // console.log('[PasteArea] Board cleared, resetting state...');
        
        // Reset URL and storage mode
        const newPath = '/';
        window.history.replaceState({}, '', newPath);
        localStorage.setItem('storageMode', 'local');
        
        // Reset storage mode and board ID
        setStorageMode('local');
        setBoardId(null);
        
        // Update all state
        setTimeSettings(null);
        setIsExpired(false);
        setItems([]);
        setShowTimeInput(true);
      }
    } catch (error) {
      // console.error('[PasteArea] Error during restart:', error);
    } finally {
      // Reset clearing flag
      isClearingRef.current = false;
    }
  };

  // Add mouse up handler to detect drag end
  useEffect(() => {
    const handleMouseUp = () => {
      // console.log('Mouse up detected', { 
      //   isDragging: isDraggingRef.current, 
      //   activeItemRef: activeItemRef.current,
      //   hasStorage: !!storage
      // });
      
      if (!storage) {
        // console.error('No storage available for position update');
        return;
      }
      
      if (isDraggingRef.current && activeItemRef.current && panzoomRef.current) {
        // console.log('Drag ended via mouse up');
        // Get the current elements from PanZoom
        const elements = panzoomRef.current.getElements();
        if (elements && elements[activeItemRef.current]) {
          const elementData = elements[activeItemRef.current];
          // console.log('Current element data:', elementData);
          
          // Get position from the position object
          const position = elementData.position;
          if (!position) {
            // console.error('No position data found in element:', elementData);
            return;
          }
          
          // Validate position values
          const x = Number(position.x);
          const y = Number(position.y);
          
          if (isNaN(x) || isNaN(y)) {
            // console.error('Invalid position values:', { x: position.x, y: position.y });
            return;
          }

          const newPosition = {
            x: Math.round(x),
            y: Math.round(y)
          };
          
          // console.log('Saving position from mouse up:', newPosition);
          
          // Update both local state and storage
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === activeItemRef.current 
                ? { ...item, position: newPosition }
                : item
            )
          );
          
          // Save to storage
          updateCard(activeItemRef.current, { 
            position: newPosition
          });
        }
        setIsDragging(false);
        isDraggingRef.current = false;
        wasDraggedRef.current = false;
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [storage]);

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
    setIsEditing(active);
  };

  const handleClearCanvas = async () => {
    // Set clearing flag
    isClearingRef.current = true;

    // Start the animation first
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

    // Wait for animation to complete before clearing storage and state
    const animationDuration = elements.length * 100 + 500;
    await new Promise(resolve => setTimeout(resolve, animationDuration));

    try {
      // Then clear the storage
      if (storage) {
        // console.log('[PasteArea] Clearing items from storage...');
        const success = await storage.clearItems();
        if (!success) {
          // console.error('[PasteArea] Failed to clear items from storage');
          return;
        }
      }

      // console.log('[PasteArea] Updating state after clear...');
      // Only clear items, keep time settings
      setItems([]);
    } catch (error) {
      // console.error('[PasteArea] Error during clear:', error);
    } finally {
      // Reset clearing flag after everything is done
      isClearingRef.current = false;
    }
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    if (timeSettings) {
      inactivityTimer.current = setTimeout(() => {
        setIsInactive(true);
      }, 180000); // 3 minutes in milliseconds
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

  // Delay and await timeSettings query before showing the time dialog
  useEffect(() => {
    let isMounted = true;
    const checkTimeSettings = async () => {
      setLoadingTimeSettings(true);
      // Wait 0.5 seconds before checking
      await new Promise(res => setTimeout(res, 300));
      if (!isMounted) return;
      if (!timeSettings) {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const urlBoardId = pathParts[0] || null;
        const alreadyVisited = (!urlBoardId && localStorage.getItem('localBoardActive') === 'true') ||
          (urlBoardId && getVisitedBoards().includes(urlBoardId));
        if (!alreadyVisited) {
          const hasVisited = localStorage.getItem('hasVisitedBefore');
          if (!hasVisited) {
            setShowTimeInput(false);
            setLoadingTimeSettings(false);
            return;
          }
        }
        setShowTimeInput(true);
      }
      setLoadingTimeSettings(false);
    };
    checkTimeSettings();
    return () => { isMounted = false; };
  }, [timeSettings]);

  useEffect(() => {
    // Add paste event listener to the window
    window.addEventListener('paste', handlePaste);
    
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const handleImportArenaItems = async (arenaItems) => {
    try {
      // Position items using layout algorithm
      const positionedItems = layoutArenaItems(arenaItems);
      
      // Add items to storage and state
      for (const item of positionedItems) {
        // Create new item without the original ID
        const newItem = {
          type: item.type,
          content: item.content,
          position: item.position,
          metadata: item.metadata,
          sourceUrl: item.sourceUrl
        };
        
        try {
          // Use saveAndUpdateItems which will handle both saving and state updates
          await saveAndUpdateItems(storage, newItem, setItems);
        } catch (error) {
          // console.error('Error saving individual item:', error);
          // Continue with other items even if one fails
        }
      }
    } catch (error) {
      // console.error('Error importing Are.na items:', error);
    }
  };

  useEffect(() => {
    if (boardId) addVisitedBoard(boardId);
  }, [boardId]);

  useEffect(() => {
    localStorage.setItem('localBoardActive', 'true');
  }, []);

  const visibleItems = useMemo(() => {
    const seen = new Set();
    return items.filter(item => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [items]);

  // // Add this log before rendering the items list
  // useEffect(() => {
  //   if (items && items.length > 0) {
  //     console.log('All item IDs:', items.map(item => item.id));
  //   }
  // }, [items]);

  const onElementsChangeStart = useCallback((elements) => {
    if (isInputActive || isEditing) return;

    const element = elements[0];
    if (element) {
      setIsDragging(true);
      setActiveItemRef(element.id);
      wasDraggedRef.current = true;
    }
  }, [isInputActive, isEditing]);

  const onElementsChange = useCallback((elements) => {
    if (isInputActive || isEditing) return;

    const element = elements[0];
    if (element && activeItemRef === element.id) {
      const newPosition = {
        x: Math.round(element.x),
        y: Math.round(element.y)
      };
      
      setItems(prevItems => {
        const updatedItems = [...prevItems];
        const index = updatedItems.findIndex(item => item.id === element.id);
        if (index !== -1) {
          updatedItems[index] = {
            ...updatedItems[index],
            position: newPosition
          };
        }
        return updatedItems;
      });
    }
  }, [activeItemRef, isInputActive, isEditing]);

  return (
    <>
      {loadingTimeSettings ? null : !timeSettings && (
        <MergedDialog
          isOpen={!timeSettings}
          onClose={() => setShowTimeInput(false)}
          onTimeSet={(settings) => {
            handleTimeSet(settings);
            setShowTimeInput(false);
          }}
          onStorageModeSelect={handleStorageModeChange}
        />
      )}
      {timeSettings && (
        <>
          <ExpiryDialog
            isOpen={isExpired}
            onRestart={handleRestart}
            storage={storage}
          />
          <InactivityOverlay 
            isVisible={isInactive} 
            onDismiss={handleDismissOverlay}
          />
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
            <TopToolbar 
              panzoomRef={panzoomRef} 
              onExport={onExport} 
              timeRemaining={timeRemaining}
              timeSettings={timeSettings}
              projectDescription={timeSettings?.description}
              onClearCanvas={handleClearCanvas}
            />
            <BottomToolbar 
              panzoomRef={panzoomRef} 
              onExport={onExport} 
              timeRemaining={timeRemaining}
              timeSettings={timeSettings}
              projectDescription={timeSettings?.description}
              onAddEmptyCard={addEmptyCard}
              onClearCanvas={handleClearCanvas}
              isExpired={isExpired}
              boardId={boardId}
              onImportArenaItems={handleImportArenaItems}
              isCollaborative={storageMode === 'collaborative'}
            />
            
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ width: '2160px', height: '1200px' }}
              >
                <PanZoom 
                  selecting={isSelecting}
                  zoomInitial={0.7}
                  zoomMin={0.5}
                  zoomMax={2}
                  ref={panzoomRef}
                  className="canvas-area"
                  onContainerClick={() => setSelectedId(null)}
                  disabled={isInputActive || isEditing}
                  draggable={!isInputActive && !isEditing}
                  containerClassNames={{
                    outer: 'canvas-area',
                    inner: 'canvas-area__in'
                  }}
                  onElementsChange={(element) => {
                    console.log('PasteArea: PanZoom onElementsChange', {
                      isInputActive,
                      isEditing,
                      element
                    });
                    
                    // Don't handle element changes if input is active
                    if (isInputActive || isEditing) {
                      console.log('PasteArea: Element change prevented - input is active');
                      return;
                    }
                    
                    if (!activeItemRef.current) return;
                    const elementData = element[activeItemRef.current];
                    if (elementData) {
                      // Validate position values
                      const x = Number(elementData.x);
                      const y = Number(elementData.y);
                      
                      if (isNaN(x) || isNaN(y)) {
                        return;
                      }

                      // If this is the first position change, it means we're starting to drag
                      if (!isDraggingRef.current) {
                        setIsDragging(true);
                        isDraggingRef.current = true;
                        wasDraggedRef.current = true;
                        const element = document.getElementById(activeItemRef.current);
                        if (element) {
                          element.classList.add('dragging');
                        }
                      }

                      // Update local state immediately for smooth dragging
                      setItems(prevItems => 
                        prevItems.map(item => 
                          item.id === activeItemRef.current 
                            ? { ...item, position: { x, y } }
                            : item
                        )
                      );
                    }
                  }}
                  onElementsChangeStart={(elements) => {
                    console.log('PasteArea: PanZoom onElementsChangeStart', {
                      isInputActive,
                      isEditing,
                      elements
                    });
                    
                    // Don't start dragging if any item is being edited
                    if (isInputActive || isEditing) {
                      console.log('PasteArea: Drag start prevented - input is active');
                      return;
                    }

                    const element = elements[0];
                    if (element) {
                      setIsDragging(true);
                      setActiveItemRef(element.id);
                      wasDraggedRef.current = true;
                      console.log('PasteArea: Drag started:', { elementId: element.id });
                    }
                  }}
                  onElementsChangeEnd={(element) => {
                    console.log('PasteArea: PanZoom onElementsChangeEnd', {
                      isInputActive,
                      isEditing,
                      element
                    });
                    
                    // Don't handle element changes if input is active
                    if (isInputActive || isEditing) {
                      console.log('PasteArea: Element change end prevented - input is active');
                      return;
                    }
                    
                    setIsDragging(false);
                    isDraggingRef.current = false;
                    if (activeItemRef.current) {
                      const element = document.getElementById(activeItemRef.current);
                      if (element) {
                        element.classList.remove('dragging');
                      }
                    }
                    // Reset drag flag after a short delay
                    setTimeout(() => {
                      wasDraggedRef.current = false;
                    }, 100);
                    
                    // Save position to storage when drag ends
                    if (!activeItemRef.current) return;
                    
                    const elementData = element[activeItemRef.current];
                    if (elementData) {
                      // Validate and ensure we have valid coordinates
                      const x = Number(elementData.x);
                      const y = Number(elementData.y);
                      
                      if (isNaN(x) || isNaN(y)) return;

                      const newPosition = {
                        x: Math.round(x),
                        y: Math.round(y)
                      };
                      
                      // Update both local state and storage
                      setItems(prevItems => 
                        prevItems.map(item => 
                          item.id === activeItemRef.current 
                            ? { ...item, position: newPosition }
                            : item
                        )
                      );
                      
                      // Save to storage
                      updateCard(activeItemRef.current, { 
                        position: newPosition
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
                  
                  {visibleItems.map(item => (
                    <Element
                      key={item.id + '-outer'}
                      id={item.id}
                      className={`paste-item ${selectedId === item.id ? 'selected' : ''} ${isDragging && selectedId === item.id ? 'dragging' : ''}`}
                      onClick={(e) => {
                        if (!isExpired) {
                          const now = Date.now();
                          const timeSinceLastClick = now - lastClickTimeRef.current;
                          
                          // console.log('Item clicked:', { 
                          //   itemId: item.id, 
                          //   activeItemRef: activeItemRef.current,
                          //   timeSinceLastClick,
                          //   lastSelectedId: lastSelectedIdRef.current
                          // });
                          
                          // If clicking the same item within 300ms, it's a double click
                          if (lastSelectedIdRef.current === item.id && timeSinceLastClick < 300) {
                            // Double click - do nothing, let TextCard handle it
                            // console.log('Double click detected, letting TextCard handle it');
                            lastClickTimeRef.current = 0;
                            lastSelectedIdRef.current = null;
                          } else {
                            // Single click - select the item
                            // console.log('Single click detected, selecting item');
                            setSelectedId(item.id);
                            activeItemRef.current = item.id;
                            lastClickTimeRef.current = now;
                            lastSelectedIdRef.current = item.id;
                          }
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
                          storage={storage}
                        />
                      ) : item.type === 'link' ? (
                        <LinkCard 
                          url={item.content} 
                          itemId={item.id}
                          initialMetadata={item.metadata}
                          storage={storage}
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
                          storage={storage}
                          isSelected={selectedId === item.id}
                          wasDragged={wasDraggedRef.current}
                        />
                      ) : item.type === 'newText' ? (
                        <TextCard
                          content={item.content}
                          itemId={item.id}
                          isEmpty={item.isEmpty}
                          showSourceUrl={false}
                          onInputActiveChange={handleInputActiveChange}
                          type="newText"
                          storage={storage}
                          isSelected={selectedId === item.id}
                          wasDragged={wasDraggedRef.current}
                        />
                      ) : null}
                    </Element>
                  ))}
                </PanZoom>
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </>
  );
};

export default PasteArea;