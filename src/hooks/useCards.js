import { useState, useCallback, useEffect } from 'react';
import { db, loadItems } from '../utils/storage';

export const useCards = () => {
  const [items, setItems] = useState([]);

  // Load items on mount
  useEffect(() => {
    const loadStoredItems = async () => {
      try {
        const storedItems = await loadItems();
        console.log('Loaded stored items:', storedItems); // Debug log
        setItems(storedItems || []);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    };
    loadStoredItems();
  }, []);

  const addCard = useCallback(async (newItem) => {
    console.log('Adding new card:', newItem);
    try {
      // Add to database first
      const id = await db.items.add(newItem);
      console.log('Added to database with id:', id);

      // Create the complete item with the ID
      const completeItem = { ...newItem, id };
      
      // Update state with the complete item
      setItems(prev => {
        const newItems = [...prev, completeItem];
        console.log('Updated items state:', newItems);
        return newItems;
      });

      return id;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  }, []);

  const updateCard = useCallback(async (id, updates) => {
    console.log('Updating card:', { id, updates }); // Debug log
    try {
      await db.items.update(id, updates);
      setItems(prev => {
        const newItems = prev.map(item => item.id === id ? { ...item, ...updates } : item);
        console.log('Updated items after update:', newItems); // Debug log
        return newItems;
      });
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }, []);

  const deleteCard = useCallback(async (id) => {
    console.log('Deleting card:', id); // Debug log
    try {
      await db.items.delete(id);
      setItems(prev => {
        const newItems = prev.filter(item => item.id !== id);
        console.log('Updated items after delete:', newItems); // Debug log
        return newItems;
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }, []);

  return {
    items,
    setItems,
    addCard,
    updateCard,
    deleteCard,
  };
}; 