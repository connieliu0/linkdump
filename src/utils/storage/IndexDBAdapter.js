// src/utils/storage/IndexedDBAdapter.js
import Dexie from 'dexie';

export class IndexedDBAdapter extends StorageAdapter {
  constructor() {
    super();
    this.db = null;
    this.initDB();
  }
  
  async initDB() {
    this.db = new Dexie('CanvasDB');
    // Define database schema
    this.db.version(1).stores({
      items: '++id,type,content,position,sourceUrl',
      settings: 'id,endTime,halfwayPoint,totalSeconds,description'
    });
  }
  
  async saveItem(item) {
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
  
  async loadItems()  {
    try {
      return await db.items.toArray();
    } catch (error) {
      console.error('Error loading from IndexDB:', error);
      return [];
    }
  };
  
  async updateItem(id, updates) {
    try {
      await this.db.items.update(id, updates);
    } catch (error) {
      console.error('Error updating item in IndexDB:', error);
    }
  }

  async deleteItem(id) {
    try {
      await this.db.items.delete(id);
    } catch (error) {
      console.error('Error deleting from IndexDB:', error);
    }
  }

  async saveTimeSettings(timeSettings) {
    try {
      await this.db.settings.put({ 
        id: 1, 
        ...timeSettings,
        description: timeSettings.description || ''
      });
    } catch (error) {
      console.error('Error saving time settings to IndexDB:', error);
    }
  }

  async getTimeSettings() {
    try {
      return await this.db.settings.get(1);
    } catch (error) {
      console.error('Error getting time settings from IndexDB:', error);
      return null;
    }
  }

  async clearBoard() {
    try {
      await this.db.items.clear();
      await this.db.settings.clear();
    } catch (error) {
      console.error('Error clearing board in IndexDB:', error);
    }
  }
}