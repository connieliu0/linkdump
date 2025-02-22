// src/components/PasteArea.jsx
import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { db, saveItem, loadItems } from '../utils/storage';
import LinkCard from './LinkCard';
import ImageCard from './ImageCard';

const MAX_WIDTH = 800; // Maximum width for images
const COMPRESSION_QUALITY = 0.7; // 0 = max compression, 1 = max quality

const PasteArea = () => {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasSize] = useState({ width: 3000, height: 3000 });
  const nodeRefs = useRef(new Map()).current;

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

  // Get or create a ref for an item
  const getNodeRef = (id) => {
    if (!nodeRefs.has(id)) {
      nodeRefs.set(id, React.createRef());
    }
    return nodeRefs.get(id);
  };

  // New function to compress and resize image
  const processImage = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG
        resolve(canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY));
      };
      img.src = dataUrl;
    });
  };

  const handlePaste = async (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    
    const x = window.scrollX + e.clientX;
    const y = window.scrollY + e.clientY;
    
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

  const handleDragStop = async (id, e, data) => {
    try {
      const newPosition = { x: Math.round(data.x), y: Math.round(data.y) };
      await db.items.update(id, { position: newPosition });
      setItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, position: newPosition }
          : item
      ));
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const handleDelete = async (id) => {
    await db.items.delete(id);
    setItems(prev => prev.filter(item => item.id !== id));
    nodeRefs.delete(id);
    setSelectedId(null);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      handleDelete(selectedId);
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target.className === 'canvas-area') {
      setSelectedId(null);
    }
  };

  return (
    <div className="paste-container" onPaste={handlePaste} onKeyDown={handleKeyDown} tabIndex={0}>
      <div 
        className="canvas-area"
        style={{ width: canvasSize.width, height: canvasSize.height }}
        onClick={handleCanvasClick}
      >
        <div style={{ 
          position: 'fixed', 
          top: '1rem', 
          left: '50%', 
          transform: 'translateX(-50%)',
          color: '#6B7280'
        }}>
          Paste an image or link here
        </div>
        
        {items.map(item => {
          // Ensure position values are numbers
          const x = Number(item.position?.x) || 0;
          const y = Number(item.position?.y) || 0;
          
          return (
            <Draggable
              key={item.id}
              nodeRef={getNodeRef(item.id)}
              defaultPosition={{ x, y }}
              onDrag={(e, data) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onStop={(e, data) => handleDragStop(item.id, e, data)}
              bounds="parent"
            >
              <div 
                ref={getNodeRef(item.id)}
                className={`paste-item ${selectedId === item.id ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(item.id);
                }}
                style={{
                  position: 'absolute',
                  transform: `translate(${x}px, ${y}px)`
                }}
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
              </div>
            </Draggable>
          );
        })}
      </div>
    </div>
  );
};

export default PasteArea;