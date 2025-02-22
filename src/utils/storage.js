// src/utils/storage.js
import Dexie from 'dexie';

export const db = new Dexie('CanvasDB');

db.version(1).stores({
  items: '++id,type,content,position'
});

export const saveItem = async (item) => {
  try {
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