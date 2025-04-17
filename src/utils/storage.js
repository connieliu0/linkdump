// src/utils/storage.js
import { ref, set, onValue, remove, update, get } from 'firebase/database';
import { db } from './firebase';

/**
 * @typedef {Object} ItemPreview
 * @property {string} [title]
 * @property {string} [favicon]
 */

/**
 * @typedef {Object} StorageItem
 * @property {string} id
 * @property {'image' | 'text' | 'link'} type
 * @property {string} content
 * @property {number} position
 * @property {string} [sourceUrl]
 * @property {ItemPreview} [preview]
 * @property {number} timestamp
 */

export const saveItem = async (item) => {
  console.log('Saving item to database:', item);
  try {
    const newRef = ref(db, `items/${Date.now()}`);
    await set(newRef, item);
    console.log('Item saved successfully with id:', newRef.key);
    return newRef.key;
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
};

export const loadItems = (callback) => {
  console.log('Setting up real-time items listener');
  const itemsRef = ref(db, 'items');
  
  try {
    return onValue(itemsRef, (snapshot) => {
      try {
        const data = snapshot.val() || {};
        const items = Object.entries(data).map(([id, item]) => ({
          ...item,
          id
        }));
        console.log('Loaded items:', items);
        callback(items);
      } catch (error) {
        console.error('Error processing items data:', error);
        console.error('Snapshot value:', snapshot.val());
        callback([]);
      }
    }, (error) => {
      console.error('Firebase onValue error:', error);
      // If there's a permission error, log it clearly
      if (error.code === 'PERMISSION_DENIED') {
        console.error('Firebase permission denied. Please check database rules.');
      }
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up Firebase listener:', error);
    return () => {}; // Return a no-op cleanup function
  }
};

export const saveTimeSettings = async (settings) => {
  try {
    const timeSettings = {
      id: 'timeSettings',
      endTime: Number(settings.endTime),
      halfwayPoint: Number(settings.halfwayPoint),
      totalSeconds: Number(settings.totalSeconds)
    };
    
    await set(ref(db, 'timeSettings'), timeSettings);
    return true;
  } catch (error) {
    console.error('Error saving time settings:', error);
    throw error;
  }
};

export const getTimeSettings = async () => {
  try {
    const snapshot = await get(ref(db, 'timeSettings'));
    return snapshot.val();
  } catch (error) {
    console.error('Error getting time settings:', error);
    return null;
  }
};

export const clearBoard = async () => {
  try {
    await remove(ref(db, 'items'));
    await remove(ref(db, 'timeSettings')); // Also clear time settings when clearing the board
    return true;
  } catch (error) {
    console.error('Error clearing board:', error);
    return false;
  }
};

// Add a function to delete an item by ID
export const deleteItem = async (id) => {
  try {
    await remove(ref(db, `items/${id}`));
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// Add function to update item position
export const updateItemPosition = async (id, position) => {
  try {
    await update(ref(db, `items/${id}`), { position });
    return true;
  } catch (error) {
    console.error('Error updating item position:', error);
    throw error;
  }
};