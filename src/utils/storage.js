// src/utils/storage.js
import Dexie from 'dexie';

export const db = new Dexie('CanvasDB');

db.version(2).stores({
  items: '++id,type,content,position',
  settings: 'id,endTime,halfwayPoint,totalSeconds'
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