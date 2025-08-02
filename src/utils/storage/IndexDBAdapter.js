// src/utils/storage/IndexedDBAdapter.js
import Dexie from 'dexie';
import { StorageAdapter } from './StorageAdapter';

export class IndexedDBAdapter extends StorageAdapter {
  constructor() {
    super();
    this.db = null;
    this.dbReady = this.initDB();
  }
  
  async initDB() {
    this.db = new Dexie('CanvasDB');
    // Define database schema
    this.db.version(2).stores({
      items: '++id,type,content,position,sourceUrl',
      settings: 'id,endTime,halfwayPoint,totalSeconds,description',
      preferences: 'key,value'
    });
    await this.db.open();
  }

  async ensureDB() {
    if (!this.db) {
      await this.dbReady;
    }
  }
  
  async saveItem(item) {
    try {
      await this.ensureDB();
      // Ensure timestamp is set
      if (!item.timestamp) {
        item.timestamp = Date.now();
      }
      const id = await this.db.items.add(item);
      return id;
    } catch (error) {
      console.error('Error saving to IndexDB:', error);
      throw error;
    }
  }
  
  async loadItems() {
    try {
      await this.ensureDB();
      return await this.db.items.toArray();
    } catch (error) {
      console.error('Error loading from IndexDB:', error);
      return [];
    }
  }
  
  async updateItem(id, updates) {
    try {
      await this.ensureDB();
      await this.db.items.update(id, updates);
      return true;
    } catch (error) {
      console.error('Error updating item in IndexDB:', error);
      throw error;
    }
  }

  async deleteItem(id) {
    try {
      await this.ensureDB();
      await this.db.items.delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting from IndexDB:', error);
      throw error;
    }
  }

  async saveTimeSettings(settings) {
    try {
      await this.ensureDB();
      const timeSettings = {
        id: 1,
        description: settings.description || '',
        startTime: Number(settings.startTime),
        duration: Number(settings.duration), // Duration in minutes
        halfwayPoint: Number(settings.halfwayPoint)
      };
      await this.db.settings.put(timeSettings);
      return true;
    } catch (error) {
      console.error('Error saving time settings to IndexDB:', error);
      throw error;
    }
  }

  async getTimeSettings() {
    try {
      await this.ensureDB();
      const settings = await this.db.settings.get(1);
      return settings || null; // Always return null if not found
    } catch (error) {
      console.error('Error getting time settings from IndexDB:', error);
      return null;
    }
  }

  async clearItems() {
    try {
      await this.ensureDB();
      
      // Only clear items
      await this.db.items.clear();
      
      console.log('[IndexDBAdapter] Items cleared successfully');
      return true;
    } catch (error) {
      console.error('[IndexDBAdapter] Error clearing items:', error);
      return false;
    }
  }

  async clearBoard() {
    try {
      await this.ensureDB();
      console.log('[IndexDBAdapter] Starting board clear...');
      
      // Clear both items and settings
      await Promise.all([
        this.db.items.clear(),
        this.db.settings.clear()
      ]);
      
      console.log('[IndexDBAdapter] Board cleared successfully');
      return true;
    } catch (error) {
      console.error('[IndexDBAdapter] Error clearing board:', error);
      return false;
    }
  }

  async getCustomUrlBackhalf() {
    try {
      await this.ensureDB();
      const pref = await this.db.preferences.get('customUrlBackhalf');
      return pref?.value || null;
    } catch (error) {
      console.error('Error getting custom URL backhalf from IndexDB:', error);
      return null;
    }
  }

  async saveCustomUrlBackhalf(backhalf) {
    try {
      await this.ensureDB();
      await this.db.preferences.put({
        key: 'customUrlBackhalf',
        value: backhalf
      });
      return true;
    } catch (error) {
      console.error('Error saving custom URL backhalf to IndexDB:', error);
      return false;
    }
  }
}