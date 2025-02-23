// src/components/PasteArea.jsx
import React, { useState, useEffect, useRef } from 'react';
import PanZoom, { Element } from '@sasza/react-panzoom';
import { db, saveItem, loadItems } from '../utils/storage';
import LinkCard from './LinkCard';
import ImageCard from './ImageCard';
import { findLinkGroups, generateCSV, downloadCSV } from '../utils/export';

const PasteArea = () => {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const panzoomRef = useRef();
  const activeItemRef = useRef(null);
  const containerRef = useRef();

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

  // Keep focus on container
  useEffect(() => {
    containerRef.current?.focus();
    
    const handleClick = () => containerRef.current?.focus();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleExport = () => {
    if (!panzoomRef.current) return;
    const elements = document.querySelectorAll('.link-card, .text-content');
    if (!elements.length) return;
    const groups = findLinkGroups(Array.from(elements), panzoomRef.current);
    const csv = generateCSV(groups);
    downloadCSV(csv);
  };

  const handleMouseMove = (e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handlePaste = async (e) => {
    console.log("Paste event triggered", e.clientX, e.clientY);
    e.preventDefault();
    const clipboardData = e.clipboardData;
    
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
      ref={containerRef}
      className="paste-container" 
      onPaste={handlePaste} 
      onKeyDown={handleKeyDown} 
      onMouseMove={handleMouseMove}
      tabIndex={0}
      autoFocus
      style={{ cursor: 'pointer' }}
    >
      <PanZoom 
        ref={panzoomRef}
        className="canvas-area"
        style={{ width: '100%', height: '100vh' }}
        onContainerClick={() => {
          setSelectedId(null);
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
        minZoom={0.1}
        maxZoom={2}
        initialZoom={1}
        boundaryRatio={0.8}
        center
      >
        <div style={{ 
          position: 'fixed', 
          top: '1rem', 
          left: '50%', 
          transform: 'translateX(-50%)',
          color: '#6B7280',
          pointerEvents: 'none',
          zIndex: 1000
        }}>
          Paste an image or link here
          <button
            onClick={handleExport}
            style={{ 
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              zIndex: 1000,
              backgroundColor: '#3B82F6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          >
            Export Links
          </button>
        </div>
        
        {items.map(item => (
          <Element
            key={item.id}
            id={item.id}
            className={`paste-item ${selectedId === item.id ? 'selected' : ''}`}
            onClick={(e) => {
              setSelectedId(item.id);
              activeItemRef.current = item.id;
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