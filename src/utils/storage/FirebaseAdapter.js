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

// Characters to use for short IDs (alphanumeric, lowercase only)
const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 5;

export class FirebaseAdapter extends StorageAdapter {
  constructor(boardId = null) {
    super();
    this.connected = false;
    
    // Monitor connection state
    const connectedRef = ref(db, '.info/connected');
    onValue(connectedRef, (snap) => {
      this.connected = snap.val();
    });
    
    if (boardId) {
      this.setBoardId(boardId);
    }
  }

  // Generate a random short ID and check if it's available
  async generateShortId() {
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops

    while (attempts < maxAttempts) {
      try {
        // Generate a random 5-character string
        let result = '';
        for (let i = 0; i < ID_LENGTH; i++) {
          result += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
        }

        // Check if this ID is available
        const isAvailable = await this.checkUrlAvailability(result);
        if (isAvailable) {
          return result;
        }

        attempts++;
      } catch (error) {
        console.error('Error generating short ID:', error);
        attempts++;
      }
    }
    
    throw new Error('Could not generate a unique board ID. Please try again.');
  }

  async generateBoardId(customId = null) {
    try {
      if (customId) {
        // Check if the board exists
        const isAvailable = await this.checkUrlAvailability(customId);
        
        if (!isAvailable) {
          throw new Error("This board name is already taken");
        }
        
        // Use the custom ID
        this.setBoardId(customId);
        
        // Initialize the board with empty structure
        await set(this.boardRef, { items: {}, sections: {}, timeSettings: null });
        
        return customId;
      } else {
        // Generate a new random short ID
        const newId = await this.generateShortId();
        
        // Set this as the current boardId
        this.setBoardId(newId);
        
        // Initialize the board with empty structure
        await set(this.boardRef, { items: {}, sections: {}, timeSettings: null });
        
        return newId;
      }
    } catch (error) {
      console.error('Error generating board ID:', error);
      throw error;
    }
  }

  setBoardId(id) {
    if (!id) {
      console.error('Attempted to set null boardId');
      throw new Error('Cannot set null boardId');
    }
    this.boardId = id;
    this.boardRef = ref(db, `boards/${id}`);
    return id;
  }

  async saveItem(item) {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      if (!this.connected) {
        console.warn('Firebase not connected when trying to save item');
      }
      
      // Always generate a new key for the item
      const itemId = push(ref(db, `boards/${this.boardId}/items`)).key;
      
      // Save the item with this ID
      await set(ref(db, `boards/${this.boardId}/items/${itemId}`), {
        ...item,
        id: itemId,
        timestamp: Date.now()
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

  async clearItems() {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      
      // Only clear items, not time settings
      await remove(ref(db, `boards/${this.boardId}/items`));
      
      console.log('[FirebaseAdapter] Items cleared successfully');
      return true;
    } catch (error) {
      console.error('[FirebaseAdapter] Error clearing items:', error);
      return false;
    }
  }

  async checkUrlAvailability(customId) {
    try {
      if (!customId) return false;
      
      // Check if board exists
      const snapshot = await get(ref(db, `boards/${customId}`));
      return !snapshot.exists(); // Return true if board doesn't exist
    } catch (error) {
      console.error('Error checking URL availability:', error);
      throw error;
    }
  }

  async deleteExpiredBoard(boardId) {
    try {
      await remove(ref(db, `boards/${boardId}`));
      return true;
    } catch (error) {
      console.error('Error deleting expired board:', error);
      return false;
    }
  }

  async clearBoard() {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      
      // Clear both items and time settings
      await remove(ref(db, `boards/${this.boardId}`));
      
      console.log('[FirebaseAdapter] Board cleared successfully');
      return true;
    } catch (error) {
      console.error('[FirebaseAdapter] Error clearing board:', error);
      return false;
    }
  }

  // Add method to check if board is expired
  async isBoardExpired() {
    try {
      const settings = await this.getTimeSettings();
      if (!settings) return false;
      
      const now = Date.now();
      const expiryTime = settings.startTime + (settings.duration * 60 * 1000);
      return now >= expiryTime;
    } catch (error) {
      console.error('Error checking board expiry:', error);
      return false;
    }
  }

  // Set up real-time updates
  setupRealtimeListener(callback) {
    if (!this.boardId) {
      console.error('Cannot setup listener: No boardId set');
      return () => {};
    }
    
    const itemsRef = ref(db, `boards/${this.boardId}/items`);
    
    try {
      return onValue(itemsRef, (snapshot) => {
        try {
          
          if (snapshot.exists()) {
            const items = [];
            const data = snapshot.val();
            
            for (const [id, item] of Object.entries(data)) {
              items.push({...item, id});
            }
            
            callback(items);
          } else {
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

  // Section operations
  async saveSection(section) {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      if (!this.connected) {
        console.warn('Firebase not connected when trying to save section');
      }
      
      const sectionId = push(ref(db, `boards/${this.boardId}/sections`)).key;
      
      await set(ref(db, `boards/${this.boardId}/sections/${sectionId}`), {
        ...section,
        id: sectionId,
        timestamp: Date.now()
      });
      
      console.log('Section saved successfully with id:', sectionId);
      return sectionId;
    } catch (error) {
      console.error('Error saving section:', error);
      throw error;
    }
  }

  async loadSections() {
    try {
      if (!this.boardId) {
        console.error('No boardId set when trying to load sections');
        return [];
      }
      
      const snapshot = await get(ref(db, `boards/${this.boardId}/sections`));
      
      if (snapshot.exists()) {
        const sections = [];
        const data = snapshot.val();
        
        for (const [id, section] of Object.entries(data)) {
          sections.push({...section, id});
        }
        
        return sections;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading sections:', error);
      return [];
    }
  }

  async updateSection(id, updates) {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      await update(ref(db, `boards/${this.boardId}/sections/${id}`), updates);
      return true;
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  }

  async deleteSection(id) {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      await remove(ref(db, `boards/${this.boardId}/sections/${id}`));
      return true;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  }

  async clearSections() {
    try {
      if (!this.boardId) throw new Error("No board ID set");
      await remove(ref(db, `boards/${this.boardId}/sections`));
      console.log('[FirebaseAdapter] Sections cleared successfully');
      return true;
    } catch (error) {
      console.error('[FirebaseAdapter] Error clearing sections:', error);
      return false;
    }
  }

  // Set up real-time updates for sections
  setupSectionsRealtimeListener(callback) {
    if (!this.boardId) {
      console.error('Cannot setup sections listener: No boardId set');
      return () => {};
    }
    
    const sectionsRef = ref(db, `boards/${this.boardId}/sections`);
    
    try {
      return onValue(sectionsRef, (snapshot) => {
        try {
          if (snapshot.exists()) {
            const sections = [];
            const data = snapshot.val();
            
            for (const [id, section] of Object.entries(data)) {
              sections.push({...section, id});
            }
            
            callback(sections);
          } else {
            callback([]);
          }
        } catch (error) {
          console.error('Error processing sections data:', error);
          callback([]);
        }
      }, (error) => {
        console.error('Firebase sections onValue error:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up Firebase sections listener:', error);
      return () => {};
    }
  }
}