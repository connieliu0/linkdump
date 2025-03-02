import { useState } from 'react';
import { db } from '../utils/storage';

export const useCards = () => {
  const [items, setItems] = useState([]);

  const addEmptyCard = async (position = { x: 100, y: 100 }) => {
    // Ensure position is a plain object with x,y coordinates
    const cardPosition = position && typeof position === 'object' 
      ? { x: position.x || 100, y: position.y || 100 }
      : { x: 100, y: 100 };

    const newItem = {
      type: 'newText',
      content: '',
      position: cardPosition,
      sourceUrl: '',
      isEmpty: true,
      timestamp: Date.now()
    };

    try {
      const id = await db.items.add(newItem);
      setItems(prev => [...prev, { ...newItem, id }]);
    } catch (error) {
      console.error('Error adding empty card:', error);
    }
  };

  const addCard = async (cardData) => {
    const id = await db.items.add(cardData);
    setItems(prev => [...prev, { ...cardData, id }]);
  };

  const updateCard = async (id, updates) => {
    await db.items.update(id, updates);
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteCard = async (id) => {
    await db.items.delete(id);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return {
    items,
    setItems,
    addEmptyCard,
    addCard,
    updateCard,
    deleteCard
  };
}; 