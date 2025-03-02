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

export const db = new Dexie('CanvasDB');

// Update database schema to include sourceUrl and preview
db.version(3).stores({
  items: '++id,type,content,position,sourceUrl',
  settings: 'id,endTime,halfwayPoint,totalSeconds'
}).upgrade(tx => {
  // Upgrade function to add sourceUrl to existing items
  return tx.items.toCollection().modify(item => {
    if (!item.sourceUrl) item.sourceUrl = '';
    if (!item.timestamp) item.timestamp = Date.now();
  });
});

/**
 * @param {StorageItem} item
 */
export const saveItem = async (item) => {
  try {
    // Ensure timestamp is set
    if (!item.timestamp) {
      item.timestamp = Date.now();
    }
    await db.items.add(item);
  } catch (error) {
    console.error('Error saving to IndexDB:', error);
  }
};

export const loadItems = async () => {
  try {
    return await db.items.toArray();
  } catch (error) {
    console.error('Error loading from IndexDB:', error);
    return [];
  }
};
export const saveTimeSettings = async (timeSettings) => {
  await db.settings.put({ id: 1, ...timeSettings });
};

export const getTimeSettings = async () => {
  return await db.settings.get(1);
};

export const clearBoard = async () => {
  await db.items.clear();
  await db.settings.clear();
};