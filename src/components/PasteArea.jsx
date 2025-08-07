// src/components/PasteArea.jsx
import { debounce } from 'lodash';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorageAdapter, createCollaborativeBoard } from '../utils/storage/StorageFactory';
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
import { createDefaultTimeSettings } from '../utils/timeFormatting';
import { getDefaultHomepageItems } from '../utils/defaultItems';
import { createCoordinateSystem } from '../utils/coordinates';
import { useCanvas } from '../context/CanvasContext';
import MergedDialog from './Dialog/MergedDialog';
import ConvertToCollaborativeDialog from './Dialog/ConvertToCollaborativeDialog';
import DraggableCard from './DraggableCard';

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
  const { state, dispatch } = useCanvas();
  
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
  const [selectedId, setSelectedId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 0.73 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [timeSettings, setTimeSettings] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isInputActive, setIsInputActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  let inactivityTimer = useRef(null);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [loadingTimeSettings, setLoadingTimeSettings] = useState(true);
  const [showCollaborativeDialog, setShowCollaborativeDialog] = useState(false);
  const wasDraggedRef = useRef(false);

  // Add a ref to track if we're clearing
  const isClearingRef = useRef(false);

  // Initialize storage and load time settings
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialTimeSettings = async () => {
      try {
        // Get the storage adapter
        const { adapter } = getStorageAdapter(storageMode, boardId);
        
        if (adapter && isMounted) {
          const settings = await adapter.getTimeSettings();
          
          if (settings) {
            // Check if the settings have expired
            const now = Date.now();
            const expiryTime = settings.startTime + (settings.duration * 60 * 1000);
            
            if (now < expiryTime) {
              // Settings haven't expired yet, use them
              setTimeSettings(settings);
            } else {
              // Settings have expired, clear them
              await adapter.clearBoard();
              setTimeSettings(null);
            }
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
    };
  }, [storageMode, boardId]);

  // Initialize storage based on mode and boardId
  useEffect(() => {
    console.log('[Storage Init Effect] Starting storage initialization, mode:', storageMode);
    const initializeStorage = async () => {
      // If we're at the root URL or switching to local mode
      if (window.location.pathname === '/' || storageMode === 'local') {
        console.log('[Storage Init Effect] Initializing local storage');
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
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const urlBoardId = pathParts[0];

        if (!urlBoardId) {
          // If no board ID in URL but we're in collaborative mode,
          // switch back to local mode
          handleStorageModeChange('local');
          return;
        }

        const { adapter } = getStorageAdapter('collaborative', urlBoardId);
        setStorage(adapter);
        setBoardId(urlBoardId);

        // Set up realtime listener for collaborative mode
        const unsubscribe = adapter.setupRealtimeListener((items) => {
          if (isClearingRef.current) return;
          // Sync items with CanvasContext for collaborative mode
          if (items && items.length > 0) {
            items.forEach(item => {
              const cardWithDefaults = {
                ...item,
                selected: false,
                editing: false
              };
              dispatch({ type: "ADD_CARD", payload: cardWithDefaults });
            });
          }
        });
        return () => unsubscribe();
      }
    };

    initializeStorage();
  }, [storageMode]);

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

  const updateProjectDescription = async (newDescription) => {
    if (!timeSettings || !storage) return;
    
    try {
      const updatedSettings = {
        ...timeSettings,
        description: newDescription
      };
      
      await storage.saveTimeSettings(updatedSettings);
      setTimeSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating project description:', error);
    }
  };

  const updateTimeSettings = async (newTimeSettings) => {
    if (!storage) return;
    
    try {
      await storage.saveTimeSettings(newTimeSettings);
      setTimeSettings(newTimeSettings);
    } catch (error) {
      console.error('Error updating time settings:', error);
      throw error; // Re-throw to allow component to handle error
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
      const cardWithDefaults = {
        ...newItem,
        selected: false,
        editing: false
      };
      dispatch({ type: "ADD_CARD", payload: cardWithDefaults });
      await storage.saveItem(cardWithDefaults);
    } catch (error) {
      console.error('Error adding empty card:', error);
    }
  };




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
        const cardWithDefaults = {
          ...newItem,
          selected: false,
          editing: false
        };
        dispatch({ type: "ADD_CARD", payload: cardWithDefaults });
        await storage.saveItem(cardWithDefaults);
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
        const cardWithDefaults = {
          ...newItem,
          selected: false,
          editing: false
        };
        dispatch({ type: "ADD_CARD", payload: cardWithDefaults });
        await storage.saveItem(cardWithDefaults);
      }
    } catch (error) {
      // console.error('Error saving item:', error);
    }
  }, [mousePosition, storage, dispatch]);

  // Load existing cards from storage into CanvasContext
  useEffect(() => {
    const loadExistingCards = async () => {
      if (!storage) return;
      
      try {
        const savedItems = await storage.loadItems();
        if (savedItems && savedItems.length > 0) {
          // Clear existing cards first
          dispatch({ type: "CLEAR_CANVAS" });
          // Add all saved items to CanvasContext
          savedItems.forEach(item => {
            // Ensure the card has the proper structure for CanvasContext
            const cardWithDefaults = {
              ...item,
              selected: false,
              editing: false,
              position: item.position || { x: 100, y: 100 }
            };
            dispatch({ type: "ADD_CARD", payload: cardWithDefaults });
          });
        }
      } catch (error) {
        console.error('Error loading existing cards:', error);
      }
    };

    loadExistingCards();
    

  }, [storage, dispatch]);

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
        dispatch({ type: "CLEAR_CANVAS" });
        setShowTimeInput(true);
      }
    } catch (error) {
      // console.error('[PasteArea] Error during restart:', error);
    } finally {
      // Reset clearing flag
      isClearingRef.current = false;
    }
  };

  // Function to convert from local to collaborative mode
  const convertToCollaborative = async (customUrl = null) => {
    try {
      // Get all current items from local storage
      const localItems = await storage.loadItems();
      
      // Get current time settings from local storage
      const localTimeSettings = await storage.getTimeSettings();
      
      if (!localTimeSettings) {
        console.error('No time settings found in local storage');
        return;
      }

      // Create new collaborative board
      const { adapter: firebaseAdapter } = getStorageAdapter('collaborative');
      let newBoardId;

      if (customUrl) {
        try {
          // Try to generate board with custom URL
          newBoardId = await firebaseAdapter.generateBoardId(customUrl);
        } catch (error) {
          if (error.message === 'URL_TAKEN') {
            throw error; // Re-throw to be handled by dialog
          }
          console.error('Error generating custom URL, falling back to random:', error);
          newBoardId = await firebaseAdapter.generateBoardId();
        }
      } else {
        newBoardId = await firebaseAdapter.generateBoardId();
      }

      firebaseAdapter.setBoardId(newBoardId);
      
      // Save time settings to Firebase with hasEditedTime flag preserved
      await firebaseAdapter.saveTimeSettings({
        ...localTimeSettings,
        hasEditedTime: localTimeSettings.hasEditedTime || false
      });
      
      // Copy all items to the new Firebase board
      if (localItems && localItems.length > 0) {
        for (const item of localItems) {
          await firebaseAdapter.saveItem(item);
        }
      }
      
      // Update URL with new board ID
      const newPath = `/${newBoardId}`;
      window.history.replaceState({}, '', newPath);
      
      // Update storage mode
      localStorage.setItem('storageMode', 'collaborative');
      setStorageMode('collaborative');
      
      // Update storage adapter reference and board ID
      setStorage(firebaseAdapter);
      setBoardId(newBoardId);

      // Clear local board data and flags after successful conversion
      await storage.clearBoard(); // Clear IndexedDB
      localStorage.removeItem('localBoardActive'); // Remove local board flag
      dispatch({ type: "CLEAR_CANVAS" }); // Clear CanvasContext

      // console.log('Successfully converted to collaborative mode');
      return newBoardId;
    } catch (error) {
      console.error('Error converting to collaborative mode:', error);
      throw error; // Re-throw to be handled by dialog
    }
  };



  // V0-style coordinate system
  const screenToCanvas = useCallback((screenX, screenY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: screenX, y: screenY };
    
    return {
      x: (screenX - rect.left - canvasTransform.x) / canvasTransform.scale,
      y: (screenY - rect.top - canvasTransform.y) / canvasTransform.scale,
    };
  }, [canvasTransform]);

  // Pan/zoom handlers
  const handleCanvasMouseDown = (e) => {
    // Don't start panning if clicking on a card
    if (e.target.closest('.text-container, .image-container, .link-card')) {
      return;
    }
    
    // Start panning if clicking on the background (not on a card)
    setIsPanning(true);
    setPanStart({ x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y });
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      const newX = e.clientX - panStart.x;
      const newY = e.clientY - panStart.y;
      setCanvasTransform(prev => ({ ...prev, x: newX, y: newY }));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, canvasTransform.scale * delta));
    
    // Zoom towards mouse position
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const newX = mouseX - (mouseX - canvasTransform.x) * (newScale / canvasTransform.scale);
      const newY = mouseY - (mouseY - canvasTransform.y) * (newScale / canvasTransform.scale);
      
      setCanvasTransform({ x: newX, y: newY, scale: newScale });
    }
  };


  const handleDelete = async (id) => {
    if (!storage) return;
    try {
      dispatch({ type: "DELETE_CARD", payload: id });
      await storage.deleteItem(id);
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

  // Add delete key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && 
          !state.isInputActive) {
        
        const selectedCards = state.cards.filter(card => card.selected);
        selectedCards.forEach(card => {
          dispatch({ type: "DELETE_CARD", payload: card.id });
          if (storage) {
            storage.deleteItem(card.id);
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.cards, state.isInputActive, dispatch, storage]);

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
      // Clear CanvasContext
      dispatch({ type: "CLEAR_CANVAS" });
    } catch (error) {
      // console.error('[PasteArea] Error during clear:', error);
    } finally {
      // Reset clearing flag after everything is done
      isClearingRef.current = false;
    }
  };

  const resetInactivityTimer = useMemo(() => 
    debounce(() => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      if (timeSettings) {
        inactivityTimer.current = setTimeout(() => {
          setIsInactive(true);
        }, 180000);
      }
    }, 100), // 100ms debounce
    [timeSettings]
  );

  useEffect(() => {
    // Only set up inactivity tracking if we have timeSettings
    if (!timeSettings) {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      return;
    }

    // Set up event listeners for user activity
const activityEvents = ['click', 'keydown', 'scroll'];

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

  // Handle first-time users and returning users
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [defaultItemsLoaded, setDefaultItemsLoaded] = useState(false);
  
  // Initialize storage on mount
  useEffect(() => {
    if (!storage) {
      const { adapter } = getStorageAdapter('local');
      console.log('[Initial Setup] Setting initial local storage');
      setStorage(adapter);
    }
  }, []); // Run once on mount

  useEffect(() => {
    console.log('[First-time Init Effect] Starting initialization check, defaultItemsLoaded:', defaultItemsLoaded, 'storage:', !!storage);
    let isMounted = true;
    const checkTimeSettings = async () => {
      if (!storage) {
        console.log('[First-time Init Effect] No storage available, waiting for initialization');
        return;
      }
      
      setLoadingTimeSettings(true);
      
      try {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const urlBoardId = pathParts[0] || null;
        const hasVisited = localStorage.getItem('hasVisitedBefore');

        // If we're in collaborative mode with a URL board ID, handle it separately
        if (urlBoardId && storageMode === 'collaborative') {
          const existingSettings = await storage.getTimeSettings();
          if (existingSettings) {
            setTimeSettings(existingSettings);
          } else {
            setShowTimeInput(true);
          }
          setLoadingTimeSettings(false);
          return;
        }

                  // For local mode or root URL
          if (!urlBoardId) {
            // First check if there's an existing local board
            const existingSettings = await storage.getTimeSettings();
          const localBoardActive = localStorage.getItem('localBoardActive') === 'true';
          
          if (existingSettings) {
            const now = Date.now();
            const expiryTime = existingSettings.startTime + (existingSettings.duration * 60 * 1000);
            
            if (now < expiryTime) {
              // Use existing settings if they haven't expired
              setTimeSettings(existingSettings);
              setLoadingTimeSettings(false);
              return;
            }
          }

          // If we have an active local board but settings expired, show time input
          if (localBoardActive) {
            setShowTimeInput(true);
          } else if (hasVisited) {
            setShowCreateBoardModal(true);
          } else {
            // For first-time users or when no local board exists
            if (!defaultItemsLoaded && storage) {
              console.log('[First-time Init Effect] Creating default items (not loaded yet)');
              const defaultSettings = createDefaultTimeSettings();
              
              // Save time settings
              await storage.saveTimeSettings(defaultSettings);
              setTimeSettings(defaultSettings);
              
              // Create default items
              const defaultItems = getDefaultHomepageItems();
              console.log('[First-time Init Effect] Default items created:', defaultItems.length);
              
              for (const item of defaultItems) {
                // Add to CanvasContext and save to storage
                const cardWithDefaults = {
                  ...item,
                  selected: false,
                  editing: false
                };
                dispatch({ type: "ADD_CARD", payload: cardWithDefaults });
                await storage.saveItem(cardWithDefaults);
              }
              
              localStorage.setItem('localBoardActive', 'true');
              localStorage.setItem('hasVisitedBefore', 'true');
              console.log('[First-time Init Effect] Setting defaultItemsLoaded to true');
              setDefaultItemsLoaded(true);
            }
          }
        }
      } catch (error) {
        console.error('Error in checkTimeSettings:', error);
      }
      
      setLoadingTimeSettings(false);
    };

    checkTimeSettings();
    return () => { isMounted = false; };
  }, [storageMode, storage, defaultItemsLoaded]);

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
          // Add to CanvasContext and save to storage
          const cardWithDefaults = {
            ...newItem,
            selected: false,
            editing: false
          };
          dispatch({ type: "ADD_CARD", payload: cardWithDefaults });
          await storage.saveItem(cardWithDefaults);
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




  // // Add this log before rendering the items list
  // useEffect(() => {
  //   if (items && items.length > 0) {
  //     console.log('All item IDs:', items.map(item => item.id));
  //   }
  // }, [items]);



  return (
    <>
      <ConvertToCollaborativeDialog
        isOpen={showCollaborativeDialog}
        onClose={() => setShowCollaborativeDialog(false)}
        onConvert={convertToCollaborative}
        storage={storage}
      />
      {loadingTimeSettings ? null : !timeSettings && showTimeInput && (
        <MergedDialog
          isOpen={!timeSettings && showTimeInput}
          onClose={() => setShowTimeInput(false)}
          onTimeSet={(settings) => {
            handleTimeSet(settings);
            setShowTimeInput(false);
          }}
          onStorageModeSelect={handleStorageModeChange}
        />
      )}
      {showCreateBoardModal && (
        <MergedDialog
          isOpen={showCreateBoardModal}
          onClose={() => setShowCreateBoardModal(false)}
          onTimeSet={handleTimeSet}
          onStorageModeSelect={handleStorageModeChange}
          forceTimeInputStep={true}
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
            timeRemaining={timeRemaining}
          />
          <div 
            className="paste-container" 
            onKeyDown={handleKeyDown} 
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
              onExport={onExport} 
              timeRemaining={timeRemaining}
              timeSettings={timeSettings}
              projectDescription={timeSettings?.description}
              onClearCanvas={handleClearCanvas}
              onProjectDescriptionChange={updateProjectDescription}
              onTimeSettingsUpdate={updateTimeSettings}
              onConvertToCollaborative={() => setShowCollaborativeDialog(true)}
              storageMode={storageMode}
              isOnboardingBoard={timeSettings?.description === "Your first project"}
              hasEditedTime={timeSettings?.hasEditedTime || false}
              canEditTime={!timeSettings?.hasEditedTime}
            />
            <BottomToolbar 
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
              onConvertToCollaborative={() => setShowCollaborativeDialog(true)}
              storageMode={storageMode}
            />
            
            <div 
              ref={canvasRef}
              className="paper-workspace"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.5)',
                backgroundImage: 'url(/src/assets/crumpled-paper.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: isPanning ? 'grabbing' : 'grab',
                userSelect: 'none',
                willChange: isPanning ? 'transform' : 'auto',
                transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
                transformOrigin: '0 0',
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onWheel={handleWheel}
              onClick={() => setSelectedId(null)}
            >
              
                {!isExpired && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    color: 'black',
                    pointerEvents: 'none',
                    fontSize: '1.5rem',
                    zIndex: 1000
                  }}>
                    Paste an image or link here; Hold down shift to drag and select multiple 
                  </div>
                )}
              
              {state.cards.map(card => {
                const CardComponent = {
                  'image': ImageCard,
                  'link': LinkCard,
                  'pastedText': TextCard,
                  'newText': TextCard
                }[card.type] || TextCard;
                
                return (
                  <CardComponent
                    key={card.id}
                    itemId={card.id}
                    content={card.content}
                    url={card.content} // For LinkCard
                    src={card.content} // For ImageCard
                    sourceUrl={card.sourceUrl}
                    type={card.type}
                    isEmpty={card.isEmpty}
                    showSourceUrl={card.type === 'pastedText'}
                    storage={storage}
                    onInputActiveChange={handleInputActiveChange}
                    isSelected={card.selected}
                    wasDragged={wasDraggedRef.current}
                  />
                );
              })}
              </div>
            </div>
        </>
      )}
    </>
  );
};

export default PasteArea;