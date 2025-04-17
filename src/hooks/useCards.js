import { useState, useCallback, useEffect } from 'react';
import { loadItems, saveItem, deleteItem, updateItemPosition } from '../utils/storage';

export const useCards = () => {
  const [items, setItems] = useState([]);

  // Load items on mount and set up real-time listener
  useEffect(() => {
    console.log('Setting up items listener');
    const unsubscribe = loadItems((loadedItems) => {
      console.log('Real-time update received:', loadedItems);
      setItems(loadedItems || []);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up items listener');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const addCard = useCallback(async (newItem) => {
    console.log('Adding new card:', newItem);
    try {
      // Add to database first
      const id = await saveItem(newItem);
      console.log('Added to database with id:', id);
      return id;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  }, []);

  const updateCard = useCallback(async (id, updates) => {
    console.log('Updating card:', { id, updates });
    try {
      await updateItemPosition(id, updates);
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }, []);

  const deleteCard = useCallback(async (id) => {
    console.log('Deleting card:', id);
    try {
      await deleteItem(id);
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