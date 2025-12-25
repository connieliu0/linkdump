// Firebase configuration for Chrome Extension
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBvSYH1cdLkBgrkJyo5k1IpIXOl6CSQa_Y",
  authDomain: "linkdump-f6ac5.firebaseapp.com",
  databaseURL: "https://linkdump-f6ac5-default-rtdb.firebaseio.com",
  projectId: "linkdump-f6ac5",
  storageBucket: "linkdump-f6ac5.firebasestorage.app",
  messagingSenderId: "259393222123",
  appId: "1:259393222123:web:04e84d13399b5e8d1e15ae",
  measurementId: "G-0QT7LW7YHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Save an item to a board
export async function saveItemToBoard(boardId, item) {
  if (!boardId) throw new Error("No board ID provided");
  
  const itemRef = push(ref(db, `boards/${boardId}/items`));
  const itemId = itemRef.key;
  
  await set(itemRef, {
    ...item,
    id: itemId,
    timestamp: Date.now()
  });
  
  return itemId;
}

// Create card helpers (matching main app structure)
export function createLinkCard(url, position = { x: 100, y: 100 }) {
  return {
    type: 'link',
    content: url,
    position,
    sourceUrl: '',
    isEmpty: false,
    timestamp: Date.now()
  };
}

export function createTextCard(text, position = { x: 100, y: 100 }) {
  return {
    type: 'newText',
    content: text,
    position,
    sourceUrl: '',
    isEmpty: false,
    timestamp: Date.now()
  };
}

export function createImageCard(dataUrl, position = { x: 100, y: 100 }, sourceUrl = '') {
  return {
    type: 'image',
    content: dataUrl,
    position,
    sourceUrl,
    isEmpty: false,
    timestamp: Date.now()
  };
}

// Generate random position for new items
export function randomPosition() {
  return {
    x: 100 + Math.random() * 400,
    y: 100 + Math.random() * 300
  };
}

