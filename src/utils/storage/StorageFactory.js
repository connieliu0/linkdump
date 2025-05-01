// src/utils/storage/StorageFactory.js
import { FirebaseAdapter } from './FirebaseAdapter';
import { IndexedDBAdapter } from './IndexDBAdapter';

// Factory function to get the appropriate adapter
export function getStorageAdapter(mode = 'local', existingBoardId = null) {
  if (mode === 'collaborative') {
    const adapter = new FirebaseAdapter();
    if (existingBoardId) {
      adapter.setBoardId(existingBoardId);
      return { adapter, boardId: existingBoardId };
    } else {
      // Don't generate boardId here, let the caller handle it
      return { adapter, boardId: null };
    }
  } else {
    return { adapter: new IndexedDBAdapter(), boardId: null };
  }
}

// Function to create a new collaborative board
export async function createCollaborativeBoard() {
  const adapter = new FirebaseAdapter();
  const boardId = await adapter.generateBoardId(); // Wait for the async operation
  adapter.setBoardId(boardId);
  return { adapter, boardId };
}

// Function to get adapter for an existing board
export function getExistingBoardAdapter(boardId) {
  if (!boardId) return null;
  const adapter = new FirebaseAdapter(boardId); // This already sets the boardId in constructor
  return { adapter, boardId };
}