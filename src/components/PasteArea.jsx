// src/components/PasteArea.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PanZoom, { Element } from '@sasza/react-panzoom';
import { saveItem, loadItems, updateItemPosition } from '../utils/storage';
import LinkCard from './LinkCard';
import ImageCard from './ImageCard';
import Toolbar from './Toolbar';
import TimeInputDialog from './TimeInputDialog';
import ExpiryDialog from './ExpiryDialog';
import AddContentDialog from './AddContentDialog';
import { saveTimeSettings, getTimeSettings, clearBoard } from '../utils/storage';
import { useBackgroundAnimation } from '../hooks/useBackgroundAnimation';
import { useAgingEffect } from '../hooks/useAgingEffect';
import TextCard from './TextCard';
import { useCards } from '../hooks/useCards';
import InactivityOverlay from './InactivityOverlay';
import OnboardingDialog from './OnboardingDialog';


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
    // console.log('PasteArea component mounted');
  }, []); // Empty dependency array means this only runs once on mount

  const [selectedId, setSelectedId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const panzoomRef = useRef();
  const activeItemRef = useRef(null);
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
    const settings = await getTimeSettings();
    if (settings) {
      setTimeSettings(settings);
    }
  };
  loadTimeSettings();
}, []);
useEffect(() => {
  if (!timeSettings) return;

  const interval = setInterval(() => {
    const now = Date.now();
    if (now >= timeSettings.endTime) {
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
  try {
    await saveTimeSettings(settings);
    setTimeSettings(settings);
  } catch (error) {
    console.error('Error saving time settings:', error);
    // You might want to show an error message to the user here
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
    const unsubscribe = loadItems((loadedItems) => {
      setItems(loadedItems);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  useAgingEffect(timeSettings);

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

  useBackgroundAnimation(timeSettings);

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
        await loadItems();
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
    inactivityTimer.current = setTimeout(() => {
      setIsInactive(true);
    }, 180000); // 3 minutes = 3 * 60 * 1000 milliseconds
  }, []);

  useEffect(() => {
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
  }, [resetInactivityTimer]);

  const handleDismissOverlay = () => {
    setIsInactive(false);
    resetInactivityTimer();
  };

  // Check for first visit and manage dialog sequence
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setShowOnboarding(true);
      setShowTimeInput(false); // Ensure time input is hidden initially
    } else {
      setShowTimeInput(!timeSettings); // Show time input only if no time settings
    }
  }, [timeSettings]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasVisitedBefore', 'true');
    setShowTimeInput(true); // Show time input after onboarding
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

  return (
    <>
      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            background: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            padding: '5px 0',
            zIndex: 1000,
            borderRadius: '3px'
          }}
        >
          <div 
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              hoverBackground: '#f5f5f5'
            }}
            onClick={handleDeleteFromMenu}
          >
            Delete
          </div>
        </div>
      )}

      {/* Click catcher for context menu */}
      {contextMenu.visible && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={handleCloseContextMenu}
        />
      )}

      {showOnboarding && (
        <OnboardingDialog 
          isOpen={showOnboarding}
          onClose={handleOnboardingClose} 
        />
      )}
      {!showOnboarding && showTimeInput && (
        <TimeInputDialog 
          isOpen={showTimeInput}
          onClose={() => setShowTimeInput(false)}
          onTimeSet={handleTimeSet} 
        />
      )}
      {isExpired && (
        <ExpiryDialog 
          isOpen={isExpired}
          panzoomRef={panzoomRef}
          onRestart={handleRestart} 
        />
      )}
      {showAddContentDialog && (
        <AddContentDialog
          isOpen={showAddContentDialog}
          onClose={() => setShowAddContentDialog(false)}
          onAddContent={handleAddNewContent}
        />
      )}
      <InactivityOverlay 
        isVisible={isInactive} 
        onDismiss={handleDismissOverlay}
      />
      <div 
        className="paste-container" 
        onKeyDown={(e) => {
          console.log('Container key pressed:', e.key, 'Selected ID:', selectedId);
          if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !isInputActive) {
            e.preventDefault();
            handleDelete(selectedId);
          } else if (e.key === 'Escape') {
            setSelectedId(null);
            handleCloseContextMenu();
          }
        }}
        onMouseMove={handleMouseMove}
        onClick={(e) => {
          handleContainerClick(e);
          handleCloseContextMenu();
        }}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        <Toolbar 
          panzoomRef={panzoomRef} 
          onExport={onExport} 
          timeRemaining={timeRemaining}
          timeSettings={timeSettings}
          onOpenAddContentModal={() => setShowAddContentDialog(true)}
          onClearCanvas={handleClearCanvas}
        />
        <PanZoom 
          selecting={isSelecting}
          zoomInitial={1.1}
          zoomMin={0.9}
          zoomMax={3}
          ref={panzoomRef}
          className="canvas-area"
          style={{ width: '100%', height: '100%' }}
          onContainerClick={() => {
            // Only deselect if we clicked on the container, not if we clicked an Element
            // The Element's onClick will fire first, updating selectedId if needed
            requestAnimationFrame(() => {
              console.log('PanZoom container clicked');
              setSelectedId(null); 
              handleCloseContextMenu();
            });
          }}
          disabled={isInputActive} // Disable PanZoom when input is active
          containerClassNames={{
            outer: 'canvas-area',
            inner: 'canvas-area__in'
          }}
          onElementsChange={(element) => {
            if (!activeItemRef.current) return;
            const elementData = element[activeItemRef.current];
            if (elementData) {
              updateItemPosition(activeItemRef.current, { 
                x: elementData.x, 
                y: elementData.y 
              });
            }
          }}
        >
          <div style={{ 
            position: 'fixed', 
            top: '1rem', 
            left: '50%', 
            transform: 'translateX(-50%)',
            color: 'rgb(58 67 84)',
            pointerEvents: 'none'
          }}>
            Paste an image or link here; Hold down shift to drag and select multiple 
          </div>
          
          {items.map(item => {
            return (
              <Element
                key={item.id}
                id={item.id}
                data-id={item.id} // Add data-id for easier selection
                className={`paste-item ${selectedId === item.id ? 'selected' : ''}`}
                onClick={() => {
                  // Don't use e.stopPropagation() here as PanZoom doesn't pass a real event
                  console.log('Item clicked:', item.id);
                  setSelectedId(item.id);
                  activeItemRef.current = item.id;
                }}
                // Add a regular div inside to handle context menu properly
                x={item.position?.x || 0}
                y={item.position?.y || 0}
              >
                <div 
                  onContextMenu={(e) => handleContextMenu(e, item.id)}
                  style={{ width: '100%', height: '100%' }}
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
                  ) : (
                    <TextCard
                      content={item.content}
                      itemId={item.id}
                      sourceUrl={item.sourceUrl}
                      isEmpty={item.isEmpty || false}
                      showSourceUrl={item.type === 'pastedText'}
                      onInputActiveChange={handleInputActiveChange}
                      type={item.type}
                    />
                  )}
                </div>
              </Element>
            );
          })}
        </PanZoom>
      </div>
    </>
  );
};

export default PasteArea;