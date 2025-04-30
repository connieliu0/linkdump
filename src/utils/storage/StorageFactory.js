// src/utils/storage/StorageFactory.js
import { FirebaseAdapter } from './FirebaseAdapter';
import { IndexedDBAdapter } from './IndexDBAdapter';

// Factory function to get the appropriate adapter
export function getStorageAdapter(mode = 'local', existingBoardId = null) {
  if (mode === 'collaborative') {
    const adapter = new FirebaseAdapter();
    let boardId;
    if (existingBoardId) {
      boardId = existingBoardId;
      adapter.setBoardId(boardId);
    } else {
      boardId = adapter.generateBoardId(); // This already sets the boardId
    }
    return { adapter, boardId };
  } else {
    return { adapter: new IndexedDBAdapter(), boardId: null };
  }
}

// Function to create a new collaborative board
export function createCollaborativeBoard() {
  const adapter = new FirebaseAdapter();
  const boardId = adapter.generateBoardId(); // This already sets the boardId
  return { adapter, boardId };
}

// Function to get adapter for an existing board
export function getExistingBoardAdapter(boardId) {
  if (!boardId) return null;
  const adapter = new FirebaseAdapter(boardId); // This already sets the boardId in constructor
  return { adapter, boardId };
}