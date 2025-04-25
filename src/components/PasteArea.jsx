// src/components/PasteArea.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PanZoom, { Element } from '@sasza/react-panzoom';
import { saveItem, loadItems, updateItemPosition } from '../utils/storage';
import LinkCard from './LinkCard';
import ImageCard from './ImageCard';
import Toolbar from './Toolbar';
import TimeInputDialog from './Dialog/TimeInputDialog';
import ExpiryDialog from './Dialog/ExpiryDialog';
import AddContentDialog from './Dialog/AddContentDialog';
import { saveTimeSettings, getTimeSettings, clearBoard } from '../utils/storage';
import { useAgingEffect } from '../hooks/useAgingEffect';
import { usePaperAgingEffect } from '../hooks/usePaperAgingEffect';
import TextCard from './TextCard';
import { useCards } from '../hooks/useCards';
import InactivityOverlay from './InactivityOverlay';
import OnboardingDialog from './Dialog/OnboardingDialog';
import shadowSvg from '../assets/timepasses/shadow.svg';
import shadowSvg2 from '../assets/timepasses/shadow2.svg';


const MAX_WIDTH = 800; // Maximum width for images
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
  const { 
    items, 
    setItems, 
    addCard, 
    updateCard, 
    deleteCard 
  } = useCards();

  useEffect(() => {
    console.log('PasteArea mounted');
  }, []);

  const [selectedId, setSelectedId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const panzoomRef = useRef();
  const activeItemRef = useRef(null);
  const [initialPosition, setInitialPosition] = useState({ x: 100, y: 100 });
    // Add these new states
    const [timeSettings, setTimeSettings] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isInputActive, setIsInputActive] = useState(false);
    const [isInactive, setIsInactive] = useState(false);
    let inactivityTimer = useRef(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showTimeInput, setShowTimeInput] = useState(false);
    const [showAddContentDialog, setShowAddContentDialog] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, itemId: null });
    const [isTransitioning, setIsTransitioning] = useState(false);


  // Define handlePaste first
  const handlePaste = useCallback(async (e) => {
    // Don't handle paste if Add Content dialog is open
    if (showAddContentDialog) {
      return;
    }

    // Ensure we're focused
    if (!document.activeElement.classList.contains('paste-container')) {
      document.querySelector('.paste-container')?.focus();
    }

    // Check if the active element is an input or textarea
    if (document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.classList.contains('content-input')) {
      return; // Let default paste behavior happen
    }

    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    
    // Use tracked mouse position
    const { x, y } = mousePosition;
    
    try {
      // Handle pasted images
      const imageItem = [...clipboardData.items].find(
        item => item.type.indexOf('image') !== -1
      );
      
      if (imageItem) {
        const file = imageItem.getAsFile();
        const sourceUrl = await detectImageSource(clipboardData, file);
        
        // Create an image to get dimensions
        const img = new Image();
        img.onload = async () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Get as data URL with high quality (0.85)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          const newItem = {
            type: 'image',
            content: dataUrl,
            position: { x, y },
            sourceUrl,
            timestamp: Date.now()
          };
          const id = await saveItem(newItem);
          setItems(prev => [...prev, { ...newItem, id }]);
        };
        
        // Load the image from the file
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        return;
      }

      // Handle pasted text/links
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
        const id = await saveItem(newItem);
        setItems(prev => [...prev, { ...newItem, id }]);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  }, [mousePosition, showAddContentDialog]); // Add showAddContentDialog to dependencies

// Add this effect for time management
useEffect(() => {
  const loadTimeSettings = async () => {
    console.log('Loading time settings...');
    const settings = await getTimeSettings();
    console.log('Time settings loaded:', settings);
    if (settings) {
      setTimeSettings(settings);
    }
  };
  loadTimeSettings();
}, []);
useEffect(() => {
  console.log('Time settings changed:', timeSettings);
  if (!timeSettings) return;

  const interval = setInterval(() => {
    const now = Date.now();
    if (now >= timeSettings.endTime) {
      console.log('Time expired');
      setIsExpired(true);
      clearInterval(interval);
      // Clear the board when time expires
      handleClearCanvas();
    } else {
      setTimeRemaining(Math.ceil((timeSettings.endTime - now) / 1000));
    }
  }, 1000);
  return () => clearInterval(interval);
}, [timeSettings]);

const handleTimeSet = async (settings) => {
  console.log('Setting time with:', settings);
  try {
    await saveTimeSettings(settings);
    setTimeSettings({
      ...settings,
      description: settings.description // Make sure to include the description
    });
    console.log('Time settings saved successfully');
  } catch (error) {
    console.error('Error in handleTimeSet:', error);
  }
};
  // Then add the global paste handler
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      console.log('Global paste event triggered');
      handlePaste(e);
    };
    
    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, [handlePaste]); // Only need handlePaste as dependency since it includes mousePosition

  // Load items on mount
  useEffect(() => {
    console.log('Setting up items subscription');
    const unsubscribe = loadItems((loadedItems) => {
      console.log('Items loaded:', loadedItems);
      setItems(loadedItems);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up items subscription');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  useAgingEffect(timeSettings, items);
  usePaperAgingEffect(timeSettings);

  // Track mouse position relative to panzoom
  const handleMouseMove = (e) => {
    if (panzoomRef.current) {
      const { x, y } = panzoomRef.current.getPosition(e);
      setMousePosition({ x, y });
    }
  };

  const handleDelete = async (id) => {
    if (id) {
      try {
        console.log('Deleting item with ID:', id);
      await deleteCard(id);
      setSelectedId(null);
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const handleKeyDown = (e) => {
    console.log('Key pressed:', e.key, 'Selected ID:', selectedId);
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      if (!isInputActive) {
        e.preventDefault(); // Prevent browser back navigation
      handleDelete(selectedId);
      }
    }
  };

  // Update the global keyboard event handler to add more shortcuts
  useEffect(() => {
    const globalKeyDownHandler = (e) => {
      // Handle keyboard shortcuts
      if (e.key === 'Escape') {
        // Escape key to deselect
        setSelectedId(null);
        handleCloseContextMenu();
        return;
      }
      
      // Handle delete/backspace key globally for deletion
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !isInputActive) {
        e.preventDefault();
        handleDelete(selectedId);
        return;
      }
      
      // Ctrl+A to select all items (not implemented yet)
      if (e.key === 'a' && (e.ctrlKey || e.metaKey) && !isInputActive) {
        e.preventDefault();
        // Future: implement multi-select all
        return;
      }
    };
    
    window.addEventListener('keydown', globalKeyDownHandler);
    return () => {
      window.removeEventListener('keydown', globalKeyDownHandler);
    };
  }, [selectedId, isInputActive, handleDelete]);

  // Add this before the return statement
  useEffect(() => {
    // Disable browser text selection when dragging items
    const disableTextSelection = (e) => {
      if (isSelecting) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('selectstart', disableTextSelection);
    return () => {
      document.removeEventListener('selectstart', disableTextSelection);
    };
  }, [isSelecting]);

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

  const handleRestart = async () => {
    try {
      await clearBoard(); // This will clear both items and settings
    setTimeSettings(null);
    setIsExpired(false);
    setItems([]);
      setShowTimeInput(true); // Show time input dialog again
    } catch (error) {
      console.error('Error restarting board:', error);
    }
  };

  // Pass this to TextCard
  const handleInputActiveChange = (active) => {
    setIsInputActive(active);
  };

  const handleClearCanvas = async () => {
    const elements = document.querySelectorAll('.paste-item');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('clear-animation');
        requestAnimationFrame(() => {
          el.classList.add('disappear');
        });
      }, index * 100);
    });

    setTimeout(async () => {
      try {
        await clearBoard();
      setItems([]);
      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    }, elements.length * 100 + 500);
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    if (timeSettings) {
      inactivityTimer.current = setTimeout(() => {
        setIsInactive(true);
      }, 600000); // 10 minutes
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
    const now = Date.now();
    const hasActiveTimeSettings = timeSettings && now < timeSettings.endTime;

    if (!hasVisited && !hasActiveTimeSettings) {
      // Only show onboarding for first visit if there are no active time settings
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  // Add container click handler that's not in the original code
  const handleContainerClick = (e) => {
    // Only deselect if clicking directly on the container and not on a card
    if (e.target.classList.contains('paste-container') || 
        e.target.classList.contains('canvas-area') ||
        e.target.classList.contains('canvas-area__in')) {
      setSelectedId(null);
    }
  };

  // Add a new handler to add content from the modal
  const handleAddNewContent = async (contentData) => {
    console.log('handleAddNewContent called with:', contentData);

    try {
      // Default position in the center of the viewport
      let position = { x: 100, y: 100 };

      // Try to get position from panzoom if available
      if (panzoomRef.current) {
        try {
          const transform = panzoomRef.current.getTransform();
          if (transform) {
            position = {
              x: 100 - transform.x / transform.scale,
              y: 100 - transform.y / transform.scale
            };
          }
        } catch (e) {
          console.log('Could not get panzoom position, using default');
        }
      }

      let newItem;
      if (contentData.type === 'image') {
        newItem = {
          type: 'image',
          content: contentData.content,
          position,
          sourceUrl: '',
          timestamp: Date.now()
        };
      } else {
        const isUrl = contentData.content.startsWith('http://') || contentData.content.startsWith('https://');
        newItem = {
          type: isUrl ? 'link' : 'pastedText',
          content: contentData.content,
          position,
          sourceUrl: '',
          timestamp: Date.now()
        };
      }

      const id = await saveItem(newItem);
      setShowAddContentDialog(false);
    } catch (error) {
      console.error('Error adding new content item:', error);
    }
  };

  // Add a dedicated element to handle right clicks
  const handleContextMenu = (e, itemId) => {
    if (e && e.preventDefault) {
      e.preventDefault(); // Only call if it's a real event
    }
    
    const menuX = e ? e.clientX : 0;
    const menuY = e ? e.clientY : 0;
    
    setContextMenu({
      visible: true,
      x: menuX,
      y: menuY,
      itemId
    });
  };

  // Close the context menu when clicking elsewhere
  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, itemId: null });
  };

  // Handle context menu option click
  const handleDeleteFromMenu = () => {
    if (contextMenu.itemId) {
      handleDelete(contextMenu.itemId);
    }
    handleCloseContextMenu();
  };

  // Add explicit click handler for selection
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If we clicked on a paste-item, update selection
      let targetElement = e.target;
      let itemElement = null;
      
      // Traverse up to find if we clicked on a paste-item or its child
      while (targetElement && targetElement !== document.body) {
        if (targetElement.classList && targetElement.classList.contains('paste-item')) {
          itemElement = targetElement;
          break;
        }
        targetElement = targetElement.parentElement;
      }
      
      if (itemElement) {
        // Extract the id from the element
        const itemId = itemElement.getAttribute('data-id') || 
                      itemElement.id;
        
        if (itemId) {
          console.log('Document click on item:', itemId);
          setSelectedId(itemId);
          activeItemRef.current = itemId;
        }
      } else if (e.target.classList.contains('paste-container') || 
                e.target.classList.contains('canvas-area') ||
                e.target.classList.contains('canvas-area__in')) {
        // Clear selection when clicking on the container
        setSelectedId(null);
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (showTimeInput) {
      setIsInactive(false);
    }
  }, [showTimeInput]);
  return (
    <>
      {/* First time visit - show onboarding */}
      {showOnboarding && (
        <OnboardingDialog 
          isOpen={showOnboarding}
          onClose={handleOnboardingClose} 
        />
      )}

      {/* No time settings yet - show time input */}
      {!showOnboarding && !timeSettings && (
        <TimeInputDialog 
          isOpen={true}
          onClose={() => setShowTimeInput(false)}
          onTimeSet={handleTimeSet} 
        />
      )}

      {/* Show canvas once we have time settings */}
      {timeSettings && (
        <>
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
            <Toolbar 
              panzoomRef={panzoomRef} 
              onExport={onExport} 
              timeRemaining={timeRemaining}
              timeSettings={timeSettings}
              projectDescription={timeSettings?.description}
              onOpenAddContentModal={() => setShowAddContentDialog(true)}
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
                  db.items.update(activeItemRef.current, { 
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

      {/* Show expiry dialog on top of canvas when time is up */}
      {isExpired && (
        <ExpiryDialog 
          isOpen={isExpired}
          panzoomRef={panzoomRef}
          onRestart={handleRestart} 
        />
      )}

      {/* Add Content Dialog */}
      <AddContentDialog
        isOpen={showAddContentDialog}
        onClose={() => setShowAddContentDialog(false)}
        onAddContent={handleAddNewContent}
      />
    </>
  );
};

export default PasteArea;