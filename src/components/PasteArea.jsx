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


const MAX_WIDTH = 800; // Maximum width for images
const COMPRESSION_QUALITY = 0.7; // 0 = max compression, 1 = max quality

const PasteArea = ({ onExport }) => {
  useEffect(() => {
    // console.log('PasteArea component mounted');
  }, []); // Empty dependency array means this only runs once on mount

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const panzoomRef = useRef();
  const activeItemRef = useRef(null);
    // Add these new states
    const [timeSettings, setTimeSettings] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);

  // Define handlePaste first
  const handlePaste = useCallback(async (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    
    // Use tracked mouse position
    const { x, y } = mousePosition;
    // console.log('Pasting at position:', { x, y });
    
    try {
      // Handle pasted images
      const imageItem = [...clipboardData.items].find(
        item => item.type.indexOf('image') !== -1
      );
      
      if (imageItem) {
        const blob = imageItem.getAsFile();
        const reader = new FileReader();
        reader.onload = async (event) => {
          const newItem = {
            type: 'image',
            content: event.target.result,
            position: { x, y }
          };
          const id = await db.items.add(newItem);
          setItems(prev => [...prev, { ...newItem, id }]);
        };
        reader.readAsDataURL(blob);
        return;
      }

      // Handle pasted text/links
      const text = clipboardData.getData('text');
      if (text) {
        const isUrl = text.startsWith('http://') || text.startsWith('https://');
        const newItem = {
          type: isUrl ? 'link' : 'text',
          content: text,
          position: { x, y }
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
    await db.items.delete(id);
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedId(null);
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

  return (
    <>
    {!timeSettings && (
      <TimeInputDialog onTimeSet={handleTimeSet} />
    )}
    
    {isExpired && (
      <ExpiryDialog 
        panzoomRef={panzoomRef}
        onRestart={handleRestart} 
      />
    )}
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
              <ImageCard src={item.content} />
            ) : item.type === 'link' ? (
              <LinkCard 
                url={item.content} 
                itemId={item.id}
                initialMetadata={item.metadata}
              />
            ) : (
              <div className="text-content">
                {item.content}
              </div>
            )}
          </Element>
        ))}
      </PanZoom>
    </div>
    </>
  );
};

export default PasteArea;