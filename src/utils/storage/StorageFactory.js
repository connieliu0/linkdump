// src/utils/storage/StorageFactory.js
import { FirebaseAdapter } from './FirebaseAdapter';
import { IndexedDBAdapter } from './IndexDBAdapter';

// Factory function to get the appropriate adapter
export function getStorageAdapter(mode = 'local', existingBoardId = null) {
  if (mode === 'collaborative') {
    const adapter = new FirebaseAdapter();
    const boardId = existingBoardId || adapter.generateBoardId();
    adapter.setBoardId(boardId); // Always set the boardId
    return { adapter, boardId };
  } else {
    return { adapter: new IndexedDBAdapter(), boardId: null };
  }
}

// Function to get adapter for an existing board
export function getExistingBoardAdapter(boardId) {
  if (!boardId) return null;
  const adapter = new FirebaseAdapter(boardId);
  return { adapter, boardId };
}