// src/components/PasteArea.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PanZoom, { Element } from '@sasza/react-panzoom';
import { db, saveItem, loadItems } from '../utils/storage';
import LinkCard from './LinkCard';
import ImageCard from './ImageCard';
import Toolbar from './Toolbar';
import TimeInputDialog from './TimeInputDialog';
import ExpiryDialog from './ExpiryDialog';
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
    addEmptyCard, 
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

  // Define handlePaste first
  const handlePaste = useCallback(async (e) => {
    // Check if the active element is an input or textarea
    if (document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.classList.contains('content-input')) {
      // Let the default paste behavior happen in the input
      return;
    }

    e.preventDefault();
    const clipboardData = e.clipboardData;
    
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
        
        const reader = new FileReader();
        reader.onload = async () => {
          const newItem = {
            type: 'image',
            content: reader.result,
            position: { x, y },
            sourceUrl,
            timestamp: Date.now()
          };
          const id = await db.items.add(newItem);
          setItems(prev => [...prev, { ...newItem, id }]);
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
        const id = await db.items.add(newItem);
        setItems(prev => [...prev, { ...newItem, id }]);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  }, [mousePosition]);
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
    } else {
      setTimeRemaining(Math.ceil((timeSettings.endTime - now) / 1000));
    }
  }, 1000);
  return () => clearInterval(interval);
}, [timeSettings]);

const handleTimeSet = async (settings) => {
  await saveTimeSettings(settings);
  setTimeSettings(settings);
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
    // console.log('Loading items effect running');
    const fetchItems = async () => {
      try {
        const savedItems = await loadItems();
        console.log('Loaded items with positions:', savedItems);
        setItems(savedItems || []);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    };
    fetchItems();
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
      await deleteCard(id);
      setSelectedId(null);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
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
  const handleRestart = async () => {
    await clearBoard();
    setTimeSettings(null);
    setIsExpired(false);
    setItems([]);
  };

  useBackgroundAnimation(timeSettings);

  // Pass this to TextCard
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

  return (
    <>
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
        <Toolbar 
          panzoomRef={panzoomRef} 
          onExport={onExport} 
          timeRemaining={timeRemaining}
          timeSettings={timeSettings}
          onAddEmptyCard={addEmptyCard}
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
          onContainerClick={() => setSelectedId(null)}
          disabled={isInputActive} // Disable PanZoom when input is active
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
          <div style={{ 
            position: 'fixed', 
            top: '1rem', 
            left: '50%', 
            transform: 'translateX(-50%)',
            color: '#6B7280',
            pointerEvents: 'none'
          }}>
            Paste an image or link here; Hold down shift to drag and select multiple 
          </div>
          
          {items.map(item => (
            <Element
              key={item.id}
              id={item.id}
              className={`paste-item ${selectedId === item.id ? 'selected' : ''}`}
              onClick={(e) => {
                // console.log('Setting active item:', item.id); // Debug click
                setSelectedId(item.id);
                activeItemRef.current = item.id; // Set the active item ref
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
  );
};

export default PasteArea;