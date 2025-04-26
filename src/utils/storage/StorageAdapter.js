// src/utils/storage/StorageAdapter.js

// Abstract base class that defines the interface
export class StorageAdapter {
    // Item operations
    async saveItem(item) { throw new Error("Method not implemented"); }
    async loadItems() { throw new Error("Method not implemented"); }
    async updateItem(id, updates) { throw new Error("Method not implemented"); }
    async deleteItem(id) { throw new Error("Method not implemented"); }
    
    // Time settings operations
    async saveTimeSettings(settings) { throw new Error("Method not implemented"); }
    async getTimeSettings() { throw new Error("Method not implemented"); }
    
    // Board operations
    async clearBoard() { throw new Error("Method not implemented"); }
}

// Factory function will be moved to a separate file to avoid circular dependencies
