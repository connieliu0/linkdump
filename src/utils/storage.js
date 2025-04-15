// src/utils/storage.js
import Dexie from 'dexie';

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

// Create the database
export const db = new Dexie('linkDumpDB');

// Define the database schema - using a completely new version to avoid migration issues
db.version(4).stores({
  items: '++id,type,content,position,sourceUrl,timestamp',
  settings: 'id,endTime,halfwayPoint,totalSeconds'
});

/**
 * @param {StorageItem} item
 */
export const saveItem = async (item) => {
  console.log('Saving item to database:', item);
  try {
    const id = await db.items.add(item);
    console.log('Item saved successfully with id:', id);
    return id;
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
};

export const loadItems = async () => {
  console.log('Loading items from database');
  try {
    const items = await db.items.toArray();
    console.log('Loaded items:', items);
    return items;
  } catch (error) {
    console.error('Error loading items:', error);
    return [];
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
    
    await db.settings.put(timeSettings);
    return true;
  } catch (error) {
    console.error('Error saving time settings:', error);
    throw error;
  }
};

export const getTimeSettings = async () => {
  try {
    const settings = await db.settings.get('timeSettings');
    return settings;
  } catch (error) {
    console.error('Error getting time settings:', error);
    return null;
  }
};

export const clearBoard = async () => {
  try {
    await db.items.clear();
    await db.settings.clear(); // Also clear time settings when clearing the board
    return true;
  } catch (error) {
    console.error('Error clearing board:', error);
    return false;
  }
};

// Add a function to delete an item by ID
export const deleteItem = async (id) => {
  try {
    await db.items.delete(id);
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};