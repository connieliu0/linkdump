// Firebase configuration for Chrome Extension
// Copy your values from your .env file or Firebase console

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// TODO: Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyBvSYH1cdLkBgrkJyo5k1IpIXOl6CSQa_Y",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
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

