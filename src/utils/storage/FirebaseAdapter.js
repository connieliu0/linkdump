// src/utils/storage/FirebaseAdapter.js
import { ref, set, get, push, onValue, remove, update } from 'firebase/database';
import { db } from './firebase';
import { StorageAdapter } from './StorageAdapter';
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

export class FirebaseAdapter extends StorageAdapter {
  constructor(boardId = null) {
    super();
    this.connected = false;
    
    // Monitor connection state
    const connectedRef = ref(db, '.info/connected');
    onValue(connectedRef, (snap) => {
      this.connected = snap.val();
      console.log('Firebase connection state:', this.connected);
    });
    
    if (boardId) {
      this.setBoardId(boardId);
    }
  }

  generateBoardId() {
    // Use Firebase's push() method to create a unique key
    const newBoardRef = push(ref(db, 'boards'));
    const newId = newBoardRef.key;
    
    // Set this as the current boardId
    this.setBoardId(newId);
    
    // Initialize the board with empty structure
    set(ref(db, `boards/${newId}`), { items: {}, timeSettings: null });
    
    return newId;
  }

  setBoardId(id) {
    if (!id) {
      console.error('Attempted to set null boardId');
      return null;
    }
    console.log('Setting boardId to:', id);
    this.boardId = id;
    this.boardRef = ref(db, `boards/${id}`);
    return id;
  }

  async saveItem(item) {
    console.log('Saving item to Firebase:', item);
    try {
      if (!this.boardId) throw new Error("No board ID set");
      if (!this.connected) {
        console.warn('Firebase not connected when trying to save item');
      }
      
      // Generate a key if none provided
      const itemId = item.id || push(ref(db, `boards/${this.boardId}/items`)).key;
      
      // Save the item with this ID
      await set(ref(db, `boards/${this.boardId}/items/${itemId}`), {
        ...item,
        id: itemId
      });
      
      console.log('Item saved successfully with id:', itemId);
      return itemId;
    } catch (error) {
      console.error('Error saving item:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async loadItems() {
    console.log('Loading items from Firebase, boardId:', this.boardId);
    try {
      if (!this.boardId) {
        console.error('No boardId set when trying to load items');
        return [];
      }
      
      const snapshot = await get(ref(db, `boards/${this.boardId}/items`));
      
      if (snapshot.exists()) {
        const items = [];
        const data = snapshot.val();
        
        for (const [id, item] of Object.entries(data)) {
          items.push({...item, id});
        }
        
        console.log('Loaded items:', items);
        return items;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading items:', error);
      return [];
    }
  }

  async updateItem(id, updates) {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      await update(ref(db, `boards/${this.boardId}/items/${id}`), updates);
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(id) {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      await remove(ref(db, `boards/${this.boardId}/items/${id}`));
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  async saveTimeSettings(settings) {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      
      const timeSettings = {
        id: 'timeSettings',
        description: settings.description,
        startTime: Number(settings.startTime),
        duration: Number(settings.duration), // Duration in minutes
        halfwayPoint: Number(settings.halfwayPoint),
        endTime: Number(settings.startTime) + (Number(settings.duration) * 60 * 1000) // Calculate end time in milliseconds
      };
      
      // Validate that all numeric values are valid
      if (Object.values(timeSettings).some(value => 
        typeof value === 'number' && isNaN(value)
      )) {
        throw new Error('Invalid numeric values in time settings');
      }
      
      await set(ref(db, `boards/${this.boardId}/timeSettings`), timeSettings);
      return true;
    } catch (error) {
      console.error('Error saving time settings:', error);
      throw error;
    }
  }

  async getTimeSettings() {
    try {
      if (!this.boardId) return null;
      const snapshot = await get(ref(db, `boards/${this.boardId}/timeSettings`));
      return snapshot.val();
    } catch (error) {
      console.error('Error getting time settings:', error);
      return null;
    }
  }

  async clearBoard() {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      await remove(ref(db, `boards/${this.boardId}/items`));
      await remove(ref(db, `boards/${this.boardId}/timeSettings`));
      return true;
    } catch (error) {
      console.error('Error clearing board:', error);
      return false;
    }
  }

  // Set up real-time updates
  setupRealtimeListener(callback) {
    if (!this.boardId) {
      console.error('Cannot setup listener: No boardId set');
      return () => {};
    }
    
    console.log('Setting up realtime listener for board:', this.boardId);
    const itemsRef = ref(db, `boards/${this.boardId}/items`);
    
    try {
      return onValue(itemsRef, (snapshot) => {
        try {
          console.log('Realtime update received:', {
            exists: snapshot.exists(),
            connected: this.connected,
            boardId: this.boardId
          });
          
          if (snapshot.exists()) {
            const items = [];
            const data = snapshot.val();
            
            for (const [id, item] of Object.entries(data)) {
              items.push({...item, id});
            }
            
            console.log('Processed items:', items);
            callback(items);
          } else {
            console.log('No items exist in snapshot');
            callback([]);
          }
        } catch (error) {
          console.error('Error processing items data:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          console.error('Snapshot value:', snapshot.val());
          callback([]);
        }
      }, (error) => {
        console.error('Firebase onValue error:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        if (error.code === 'PERMISSION_DENIED') {
          console.error('Firebase permission denied. Please check database rules.');
        }
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up Firebase listener:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return () => {};
    }
  }
}