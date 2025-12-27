// src/components/PasteArea.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PanZoom, { Element } from '@sasza/react-panzoom';
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
import SectionCard from './SectionCard';
import InactivityOverlay from './InactivityOverlay';
import shadowSvg from '../assets/timepasses/shadow.svg';
import shadowSvg2 from '../assets/timepasses/shadow2.svg';
import { FirebaseAdapter } from '../utils/storage/FirebaseAdapter';
import { processImage, extractImageFromClipboard, handleImageFile } from '../utils/imageProcessing';
import { detectImageSource } from '../utils/linkProcessing';
import { createImageCard, createTextCard, createLinkCard, createSection } from '../utils/cardManagement';
import { saveAndUpdateItems, updateAndRefreshItems, deleteAndRemoveItem, saveAndUpdateSections, updateAndRefreshSections, deleteAndRemoveSection } from '../utils/storageOperations';
import { layoutArenaItems } from '../utils/layoutUtils';
import { createDefaultTimeSettings } from '../utils/timeFormatting';
import { getDefaultHomepageItems } from '../utils/defaultItems';
import MergedDialog from './Dialog/MergedDialog';
import ConvertToCollaborativeDialog from './Dialog/ConvertToCollaborativeDialog';
import { normalizeSectionBounds, getCardsToMoveWithSection, moveCardsWithSection, getCardsInSection, isCardInSection } from '../utils/sectionUtils';

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
  const mousePositionRef = useRef({ x: 0, y: 0 }); // Ref to avoid stale closures
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
  const [showCollaborativeDialog, setShowCollaborativeDialog] = useState(false);
  const wasDraggedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  const lastSelectedIdRef = useRef(null);
  const originalSectionIdRef = useRef(null); // Track which section a card was in when drag started

  // Section state
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isDrawingSection, setIsDrawingSection] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [drawEnd, setDrawEnd] = useState(null);
  const [sectionDragState, setSectionDragState] = useState(null);
  const [dropTargetSectionId, setDropTargetSectionId] = useState(null);

  // Clear drop target when dragging stops
  useEffect(() => {
    if (!isDragging && dropTargetSectionId) {
      setDropTargetSectionId(null);
    }
  }, [isDragging, dropTargetSectionId]);

  // Animation state for card separation
  const [separatingCardId, setSeparatingCardId] = useState(null);
  const [newCardAnimations, setNewCardAnimations] = useState({});

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
    const initializeStorage = async () => {
      // If we're at the root URL or switching to local mode
      if (window.location.pathname === '/' || storageMode === 'local') {
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

        // Set up realtime listener for collaborative mode (items)
        const unsubscribeItems = adapter.setupRealtimeListener((items) => {
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
        
        // Set up realtime listener for sections
        const unsubscribeSections = adapter.setupSectionsRealtimeListener?.((sections) => {
          if (isClearingRef.current) return;
          const validSections = sections.filter(section => {
            if (!section?.id) {
              console.warn('Found section without ID:', section);
              return false;
            }
            return true;
          });
          setSections(validSections);
        });
        
        return () => {
          unsubscribeItems();
          if (unsubscribeSections) unsubscribeSections();
        };
      }
    };

    initializeStorage();
  }, [storageMode]);

  // Listen for URL changes and update storage mode accordingly
  useEffect(() => {
    const handleUrlChange = () => {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const urlBoardId = pathParts[0] || null;
      
      // If there's a board ID in the URL, switch to collaborative mode
      if (urlBoardId) {
        if (storageMode !== 'collaborative') {
          setStorageMode('collaborative');
          localStorage.setItem('storageMode', 'collaborative');
          setBoardId(urlBoardId);
        }
      } else {
        // If we're at the root URL, switch to local mode
        if (storageMode !== 'local') {
          setStorageMode('local');
          localStorage.setItem('storageMode', 'local');
          setBoardId(null);
        }
      }
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);
    
    // Also check on mount
    handleUrlChange();
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
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

  // Define handleSeparateCard function with animation
  const handleSeparateCard = useCallback(async (cardId) => {
    if (!storage) return;

    const card = items.find(item => item.id === cardId);
    if (!card) return;

    // Split by line breaks, filter empty lines
    const lines = (card.content || '').split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) return;

    // Step 1: Trigger fade-out animation on original card
    setSeparatingCardId(cardId);
    setSelectedId(null); // Deselect the card

    // Step 2: Wait for fade-out animation to complete (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Step 3: Delete the original card
    await deleteAndRemoveItem(storage, cardId, setItems);
    setSeparatingCardId(null);

    // Step 4: Create new cards with staggered animation delays
    // Use a safe starting position - either the original card position if reasonable,
    // or default to a visible area on the canvas
    const cardWidth = 350;   // Horizontal spacing between cards
    const cardHeight = 150;  // Vertical spacing between rows
    const cardsPerRow = 5;   // Number of cards per row before wrapping
    const staggerDelay = 0.08; // 80ms between each card
    
    // Calculate a reasonable base position
    // Start at position that keeps all cards visible (accounting for grid size)
    const totalRows = Math.ceil(lines.length / cardsPerRow);
    const gridWidth = cardsPerRow * cardWidth;
    const gridHeight = totalRows * cardHeight;
    
    // Use original position if it would keep cards on canvas, otherwise use a safe default
    const originalPos = card.position || { x: 100, y: 100 };
    const basePosition = {
      x: Math.max(50, Math.min(originalPos.x, 1500 - gridWidth)),
      y: Math.max(100, Math.min(originalPos.y, 800 - gridHeight))
    };

    const newCardIds = [];
    const animationEntries = {};

    for (let i = 0; i < lines.length; i++) {
      const col = i % cardsPerRow;
      const row = Math.floor(i / cardsPerRow);
      const newPosition = {
        x: basePosition.x + (col * cardWidth),
        y: basePosition.y + (row * cardHeight)
      };
      const newCard = createTextCard(lines[i], newPosition, false);
      newCardIds.push(newCard.id);
      
      // Track animation delay for this card
      animationEntries[newCard.id] = {
        delay: i * staggerDelay,
        createdAt: Date.now()
      };
      
      await saveAndUpdateItems(storage, newCard, setItems);
    }

    // Set animation entries for staggered fade-in
    setNewCardAnimations(prev => ({ ...prev, ...animationEntries }));

    // Clean up animation entries after animations complete (2 seconds should be enough)
    setTimeout(() => {
      setNewCardAnimations(prev => {
        const updated = { ...prev };
        newCardIds.forEach(id => delete updated[id]);
        return updated;
      });
    }, 2000);
  }, [storage, items, setItems]);

  // Section CRUD functions
  const addSection = async (sectionData) => {
    try {
      if (!storage) {
        return;
      }
      
      const newSection = createSection(sectionData.name, sectionData.bounds);
      const savedId = await saveAndUpdateSections(storage, newSection, setSections);
      
      return savedId || newSection.id;
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const updateSection = async (id, updates) => {
    try {
      await updateAndRefreshSections(storage, id, updates, setSections);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const deleteSection = async (id) => {
    try {
      await deleteAndRemoveSection(storage, id, setSections);
      if (selectedSectionId === id) {
        setSelectedSectionId(null);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  // Load items and sections when storage is ready
  useEffect(() => {
    const fetchItems = async () => {
      if (!storage) return;
      // In collaborative mode, we need both storage and boardId
      if (storageMode === 'collaborative' && !boardId) return;
      
      try {
        const savedItems = await storage.loadItems();
        // console.log('Loaded items:', savedItems);
        setItems(savedItems || []);
        
        // Also load sections
        const savedSections = await storage.loadSections();
        setSections(savedSections || []);
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
    
    // Use the ref for position (always current, avoids stale closure)
    // Paste events don't have clientX/clientY so we must use last known mouse position
    const { x, y } = mousePositionRef.current;
    
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
        const hasLineBreaks = /\r?\n/.test(text);
        const newItem = isUrl 
          ? createLinkCard(text, { x, y })
          : createTextCard(text, { x, y }, false, { canSeparate: hasLineBreaks });
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
      
      // Save time settings to Firebase
      await firebaseAdapter.saveTimeSettings(localTimeSettings);
      
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

      // console.log('Successfully converted to collaborative mode');
      return newBoardId;
    } catch (error) {
      console.error('Error converting to collaborative mode:', error);
      throw error; // Re-throw to be handled by dialog
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

  const handleDelete = async (id) => {
    if (!storage) return;
    try {
      await deleteCard(id);
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Delete a section and all cards inside it
  const handleDeleteSectionWithCards = async (sectionId) => {
    if (!storage) return;
    
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    try {
      // Get all cards inside the section
      const cardsInSection = getCardsInSection(items, section);
      
      // Delete all cards inside the section
      for (const card of cardsInSection) {
        await deleteCard(card.id);
      }
      
      // Delete the section itself
      await deleteSection(sectionId);
    } catch (error) {
      console.error('Error deleting section with cards:', error);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputActive) {
      // Delete selected card
      if (selectedId) {
        handleDelete(selectedId);
      }
      // Delete selected section (and all cards inside it)
      else if (selectedSectionId) {
        handleDeleteSectionWithCards(selectedSectionId);
      }
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

  // Handle first-time users and returning users
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [createBoardFromToolbar, setCreateBoardFromToolbar] = useState(false);
  useEffect(() => {
    let isMounted = true;
    const checkTimeSettings = async () => {
      setLoadingTimeSettings(true);
      
      try {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const urlBoardId = pathParts[0] || null;
        const { adapter } = getStorageAdapter(storageMode, urlBoardId);
        const hasVisited = localStorage.getItem('hasVisitedBefore');

        // If we're in collaborative mode with a URL board ID, handle it separately
        if (urlBoardId && storageMode === 'collaborative') {
          const existingSettings = await adapter.getTimeSettings();
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
          const existingSettings = await adapter.getTimeSettings();
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
            const defaultSettings = createDefaultTimeSettings();
            
            // Save time settings
            await adapter.saveTimeSettings(defaultSettings);
            setTimeSettings(defaultSettings);
            
            // Create default items
            const defaultItems = getDefaultHomepageItems();
            for (const item of defaultItems) {
              await saveAndUpdateItems(adapter, item, setItems);
            }
            
            localStorage.setItem('localBoardActive', 'true');
            localStorage.setItem('hasVisitedBefore', 'true');
          }
        }
      } catch (error) {
        console.error('Error in checkTimeSettings:', error);
      }
      
      setLoadingTimeSettings(false);
    };

    checkTimeSettings();
    return () => { isMounted = false; };
  }, [storageMode]);

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


  const visibleItems = useMemo(() => {
    const seen = new Set();
    return items.filter(item => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [items]);

  const visibleSections = useMemo(() => {
    const seen = new Set();
    return sections.filter(section => {
      if (!section?.id || seen.has(section.id)) return false;
      seen.add(section.id);
      return true;
    });
  }, [sections]);

  // Section drawing handlers
  const handleStartDrawingSection = useCallback(() => {
    setIsDrawingSection(true);
    setSelectedId(null);
    setSelectedSectionId(null);
  }, []);

  const handleCanvasMouseMove = useCallback((e) => {
    // Update mouse position for paste using manual coordinate conversion
    // panzoom.getPosition() returns pan position, not converted coords
    const canvasEl = document.querySelector('.canvas-area__in');
    if (!canvasEl || !panzoomRef.current) return;
    
    const rect = canvasEl.getBoundingClientRect();
    const zoom = panzoomRef.current.getZoom() || 1;
    
    // Convert screen coords to canvas coords
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // Update both ref and state
    mousePositionRef.current = { x, y };
    setMousePosition({ x, y });
  }, []);

  // Drawing overlay event handlers - these capture events when in drawing mode
  // We store both screen coords (for preview) and canvas coords (for section creation)
  const [drawStartScreen, setDrawStartScreen] = useState(null);
  const [drawEndScreen, setDrawEndScreen] = useState(null);
  
  // Helper to convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX, screenY) => {
    if (!panzoomRef.current) return { x: 0, y: 0 };
    
    // Get the canvas element (the inner element of panzoom)
    const canvasEl = document.querySelector('.canvas-area__in');
    if (!canvasEl) return { x: 0, y: 0 };
    
    const rect = canvasEl.getBoundingClientRect();
    const zoom = panzoomRef.current.getZoom() || 1;
    
    // Convert screen coords to canvas coords
    const canvasX = (screenX - rect.left) / zoom;
    const canvasY = (screenY - rect.top) / zoom;
    
    return { x: canvasX, y: canvasY };
  }, []);

  const handleDrawingMouseDown = useCallback((e) => {
    if (!panzoomRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Screen coordinates for the preview
    setDrawStartScreen({ x: e.clientX, y: e.clientY });
    setDrawEndScreen({ x: e.clientX, y: e.clientY });
    
    // Canvas coordinates for section creation - use manual conversion
    const pos = screenToCanvas(e.clientX, e.clientY);
    setDrawStart(pos);
    setDrawEnd(pos);
  }, [screenToCanvas]);

  const handleDrawingMouseMove = useCallback((e) => {
    if (!drawStart) return;
    if (!panzoomRef.current) return;
    
    // Screen coordinates for the preview
    setDrawEndScreen({ x: e.clientX, y: e.clientY });
    
    // Canvas coordinates for section creation - use manual conversion
    const pos = screenToCanvas(e.clientX, e.clientY);
    setDrawEnd(pos);
  }, [drawStart, screenToCanvas]);

  const handleDrawingMouseUp = useCallback(async (e) => {
    if (!drawStart || !drawEnd) {
      setIsDrawingSection(false);
      setDrawStartScreen(null);
      setDrawEndScreen(null);
      return;
    }
    
    const bounds = normalizeSectionBounds(drawStart, drawEnd);
    
    // Only create section if it's big enough (at least 50x50 in canvas coords)
    if (bounds.width >= 50 && bounds.height >= 50) {
      await addSection({
        name: 'Untitled Section',
        bounds
      });
    }
    
    setIsDrawingSection(false);
    setDrawStart(null);
    setDrawEnd(null);
    setDrawStartScreen(null);
    setDrawEndScreen(null);
  }, [drawStart, drawEnd, addSection]);

  // Cancel drawing on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawingSection) {
        setIsDrawingSection(false);
        setDrawStart(null);
        setDrawEnd(null);
        setDrawStartScreen(null);
        setDrawEndScreen(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawingSection]);

  // Section drag handling - move cards with section
  const handleSectionDragStart = useCallback((sectionId, e) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    // Get cards that should move with this section
    const cardIdsToMove = getCardsToMoveWithSection(section, items);
    
    setSectionDragState({
      sectionId,
      startX: e.clientX,
      startY: e.clientY,
      startBounds: { ...section.bounds },
      cardIdsToMove,
      cardStartPositions: items
        .filter(item => cardIdsToMove.includes(item.id))
        .reduce((acc, item) => {
          acc[item.id] = { ...item.position };
          return acc;
        }, {})
    });
  }, [sections, items]);

  // Handle section dragging
  useEffect(() => {
    if (!sectionDragState) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - sectionDragState.startX;
      const dy = e.clientY - sectionDragState.startY;
      
      // Get current zoom level from panzoom
      const zoom = panzoomRef.current?.getZoom() || 1;
      // Round to prevent floating point jiggle when drag ends
      const scaledDx = Math.round(dx / zoom);
      const scaledDy = Math.round(dy / zoom);
      
      // Update section bounds
      const newBounds = {
        ...sectionDragState.startBounds,
        x: sectionDragState.startBounds.x + scaledDx,
        y: sectionDragState.startBounds.y + scaledDy
      };
      
      setSections(prev => prev.map(s => 
        s.id === sectionDragState.sectionId 
          ? { ...s, bounds: newBounds }
          : s
      ));
      
      // Update card positions (rounded to match react-panzoom expectations)
      setItems(prev => prev.map(item => {
        if (sectionDragState.cardIdsToMove.includes(item.id)) {
          const startPos = sectionDragState.cardStartPositions[item.id];
          return {
            ...item,
            position: {
              x: Math.round(startPos.x + scaledDx),
              y: Math.round(startPos.y + scaledDy)
            }
          };
        }
        return item;
      }));
    };

    const handleMouseUp = async () => {
      // Capture drag state before clearing
      const dragState = sectionDragState;
      
      // Save final positions to storage BEFORE clearing drag state
      // This ensures positions are persisted while react-panzoom is still disabled
      const section = sections.find(s => s.id === dragState.sectionId);
      if (section && storage) {
        try {
          await storage.updateSection(dragState.sectionId, { bounds: section.bounds });
        } catch (e) {
          console.error('Error saving section position:', e);
        }
      }
      
      // Save card positions directly to storage (in parallel for performance)
      const savePromises = dragState.cardIdsToMove.map(async (cardId) => {
        const card = items.find(i => i.id === cardId);
        if (card && storage) {
          try {
            await storage.updateItem(cardId, { position: card.position });
          } catch (e) {
            console.error('Error saving card position:', e);
          }
        }
      });
      await Promise.all(savePromises);
      
      // Clear drag state AFTER all saves complete - this re-enables react-panzoom
      // Use requestAnimationFrame to ensure React has finished rendering with final positions
      requestAnimationFrame(() => {
        setSectionDragState(null);
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [sectionDragState, sections, items, storage]);

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
      activeItemRef.current = element.id;
      wasDraggedRef.current = true;
    }
  }, [isInputActive, isEditing]);

  const onElementsChange = useCallback((elements) => {
    if (isInputActive || isEditing) return;

    const element = elements[0];
    if (element && activeItemRef.current === element.id) {
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
  }, [isInputActive, isEditing]);

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
          onClose={() => {
            setShowCreateBoardModal(false);
            setCreateBoardFromToolbar(false);
          }}
          onTimeSet={handleTimeSet}
          onStorageModeSelect={handleStorageModeChange}
          forceTimeInputStep={true}
          allowBackdropClick={createBoardFromToolbar}
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
            className={`paste-container ${isDrawingSection ? 'drawing-section' : ''}`}
            onKeyDown={handleKeyDown} 
            onMouseMove={handleCanvasMouseMove}
            tabIndex={0}
          >
            {/* Drawing overlay - captures mouse events when drawing sections */}
            {isDrawingSection && (
              <div 
                className="section-drawing-overlay"
                onMouseDown={handleDrawingMouseDown}
                onMouseMove={handleDrawingMouseMove}
                onMouseUp={handleDrawingMouseUp}
              >
                {drawStartScreen && drawEndScreen && (
                  <div
                    className="section-drawing-preview"
                    style={{
                      left: Math.min(drawStartScreen.x, drawEndScreen.x),
                      top: Math.min(drawStartScreen.y, drawEndScreen.y),
                      width: Math.abs(drawEndScreen.x - drawStartScreen.x),
                      height: Math.abs(drawEndScreen.y - drawStartScreen.y),
                    }}
                  />
                )}
              </div>
            )}
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
              onProjectDescriptionChange={updateProjectDescription}
              onConvertToCollaborative={() => setShowCollaborativeDialog(true)}
              storageMode={storageMode}
              boardId={boardId}
              onCreateBoard={() => {
                setCreateBoardFromToolbar(true);
                setShowCreateBoardModal(true);
              }}
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
              onConvertToCollaborative={() => setShowCollaborativeDialog(true)}
              storageMode={storageMode}
              onAddSection={handleStartDrawingSection}
              isDrawingSection={isDrawingSection}
            />
            
            {/* Section drawing mode indicator */}
            {isDrawingSection && (
              <div className="section-drawing-indicator">
                Click and drag to create a section • Press Esc to cancel
              </div>
            )}
            
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ width: '3097px', height: '1750px' }}
              >
                <PanZoom 
                  selecting={isSelecting}
                  zoomInitial={0.73}
                  zoomMin={0.5}
                  zoomMax={2}
                  ref={panzoomRef}
                  className="canvas-area"
                  onContainerClick={() => {
                    setSelectedId(null);
                    setSelectedSectionId(null);
                  }}
                  disabled={isInputActive || isEditing || isDrawingSection || !!sectionDragState}
                  draggable={!isInputActive && !isEditing && !isDrawingSection && !sectionDragState}
                  containerClassNames={{
                    outer: 'canvas-area',
                    inner: 'canvas-area__in'
                  }}
                  onElementsChange={(element) => {
                    // Don't handle element changes if input is active
                    if (isInputActive || isEditing) {
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
                        
                        // Record which section the card was originally in (if any)
                        const draggedCard = items.find(item => item.id === activeItemRef.current);
                        if (draggedCard) {
                          const originalSection = sections.find(section => 
                            isCardInSection(draggedCard, section)
                          );
                          originalSectionIdRef.current = originalSection?.id || null;
                        }
                      }

                      // Check if dragged card is entering a NEW section (not the one it was originally in)
                      const tempCard = { position: { x, y } };
                      const targetSection = sections.find(section => 
                        isCardInSection(tempCard, section)
                      );
                      // Only show drop target if entering a different section than where the card started
                      const isEnteringNewSection = targetSection && targetSection.id !== originalSectionIdRef.current;
                      setDropTargetSectionId(isEnteringNewSection ? targetSection.id : null);

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
                    // Don't start dragging if any item is being edited
                    if (isInputActive || isEditing) {
                      return;
                    }

                    const element = elements[0];
                    if (element) {
                      setIsDragging(true);
                      activeItemRef.current = element.id;
                      wasDraggedRef.current = true;
                      
                      // Record which section the card was originally in (if any)
                      const draggedCard = items.find(item => item.id === element.id);
                      if (draggedCard) {
                        const originalSection = sections.find(section => 
                          isCardInSection(draggedCard, section)
                        );
                        originalSectionIdRef.current = originalSection?.id || null;
                      } else {
                        originalSectionIdRef.current = null;
                      }
                    }
                  }}
                  onElementsChangeEnd={(element) => {
                    // Always clear drop target highlight and original section tracking on drag end
                    setDropTargetSectionId(null);
                    originalSectionIdRef.current = null;
                    
                    // Don't handle element changes if input is active
                    if (isInputActive || isEditing) {
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
                      pointerEvents: 'none',
                      fontSize: '1.5rem',
                    }}>
                      Paste an image or link here; Hold down shift to drag and select multiple 
                    </div>
                  )}

                  {/* Render sections (below cards) */}
                  {visibleSections.map(section => (
                      <Element
                        key={`section-${section.id}`}
                        id={`section-${section.id}`}
                        x={section.bounds?.x || 0}
                        y={section.bounds?.y || 0}
                        className="section-element"
                      >
                        <SectionCard
                          section={section}
                          isSelected={selectedSectionId === section.id}
                          isDropTarget={dropTargetSectionId === section.id}
                          onSelect={(id) => {
                            setSelectedSectionId(id);
                            setSelectedId(null);
                          }}
                          onUpdate={updateSection}
                          onDelete={deleteSection}
                          onDragStart={handleSectionDragStart}
                        />
                      </Element>
                  ))}

                  {visibleItems.map(item => {
                    const isSeparating = separatingCardId === item.id;
                    const animationEntry = newCardAnimations[item.id];
                    
                    return (
                    <Element
                      key={item.id + '-outer'}
                      id={item.id}
                      className={`paste-item ${selectedId === item.id ? 'selected' : ''} ${isDragging && selectedId === item.id ? 'dragging' : ''}`}
                      onClick={(e) => {
                        if (!isExpired) {
                          const now = Date.now();
                          const timeSinceLastClick = now - lastClickTimeRef.current;
                          
                          // If clicking the same item within 300ms, it's a double click
                          if (lastSelectedIdRef.current === item.id && timeSinceLastClick < 300) {
                            // Double click - do nothing, let TextCard handle it
                            lastClickTimeRef.current = 0;
                            lastSelectedIdRef.current = null;
                          } else {
                            // Single click - select the item
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
                      <motion.div
                        initial={animationEntry ? { opacity: 0, y: -20, scale: 0.95 } : false}
                        animate={{ 
                          opacity: isSeparating ? 0 : 1, 
                          y: 0,
                          scale: isSeparating ? 0.95 : 1
                        }}
                        transition={{ 
                          duration: 0.3,
                          delay: animationEntry?.delay || 0,
                          ease: "easeOut"
                        }}
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
                          canSeparate={item.canSeparate || false}
                          onSeparate={() => handleSeparateCard(item.id)}
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
                          canSeparate={item.canSeparate || false}
                          onSeparate={() => handleSeparateCard(item.id)}
                        />
                      ) : null}
                      </motion.div>
                    </Element>
                    );
                  })}
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