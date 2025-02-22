// src/components/PasteArea.jsx
import React, { useState, useEffect, useRef } from 'react';
import PanZoom, { Element } from '@sasza/react-panzoom';
import { db, saveItem, loadItems } from '../utils/storage';
import LinkCard from './LinkCard';
import ImageCard from './ImageCard';

const MAX_WIDTH = 800; // Maximum width for images
const COMPRESSION_QUALITY = 0.7; // 0 = max compression, 1 = max quality

const PasteArea = () => {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const panzoomRef = useRef();

  // Load items on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const savedItems = await loadItems();
        setItems(savedItems || []);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    };
    fetchItems();
  }, []);

  // Track mouse position relative to panzoom
  const handleMouseMove = (e) => {
    if (panzoomRef.current) {
      const { x, y } = panzoomRef.current.getPosition(e);
      setMousePosition({ x, y });
    }
  };

  const handlePaste = async (e) => {
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

  return (
    <div 
      className="paste-container" 
      onPaste={handlePaste} 
      onKeyDown={handleKeyDown} 
      onMouseMove={handleMouseMove}
      tabIndex={0}
    >
      <PanZoom 
        ref={panzoomRef}
        className="canvas-area"
        style={{ width: '100%', height: '100vh' }}
        onContainerClick={() => setSelectedId(null)}
        
      >
        <div style={{ 
          position: 'fixed', 
          top: '1rem', 
          left: '50%', 
          transform: 'translateX(-50%)',
          color: '#6B7280',
          pointerEvents: 'none'
        }}>
          Paste an image or link here
        </div>
        
        {items.map(item => (
          <Element
            id={item.id}
            className={`paste-item ${selectedId === item.id ? 'selected' : ''}`}
            onClick={(e) => {
              setSelectedId(item.id);
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
  );
};

export default PasteArea;