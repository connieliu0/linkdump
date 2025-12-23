// Background service worker for Linkdump extension
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

// Image processing constants (matching main app)
const MAX_WIDTH = 300;
const COMPRESSION_QUALITY = 0.7;

// Create context menus on install
chrome.runtime.onInstalled.addListener(() => {
  // Context menu for images
  chrome.contextMenus.create({
    id: 'saveImage',
    title: 'Save image to Linkdump',
    contexts: ['image']
  });

  // Context menu for links
  chrome.contextMenus.create({
    id: 'saveLink',
    title: 'Save link to Linkdump',
    contexts: ['link']
  });

  // Context menu for selected text
  chrome.contextMenus.create({
    id: 'saveSelection',
    title: 'Save selection to Linkdump',
    contexts: ['selection']
  });
});

// Get saved board ID
async function getBoardId() {
  const result = await chrome.storage.local.get(['boardId']);
  return result.boardId || null;
}

// Save item to Firebase
async function saveItemToBoard(boardId, item) {
  if (!boardId) throw new Error("No board ID set");
  
  const itemRef = push(ref(db, `boards/${boardId}/items`));
  const itemId = itemRef.key;
  
  await set(itemRef, {
    ...item,
    id: itemId,
    timestamp: Date.now()
  });
  
  return itemId;
}

// Generate random position
function randomPosition() {
  return {
    x: 100 + Math.random() * 400,
    y: 100 + Math.random() * 300
  };
}

// Create card objects
function createLinkCard(url) {
  return {
    type: 'link',
    content: url,
    position: randomPosition(),
    sourceUrl: '',
    isEmpty: false,
    timestamp: Date.now()
  };
}

function createTextCard(text) {
  return {
    type: 'newText',
    content: text,
    position: randomPosition(),
    sourceUrl: '',
    isEmpty: false,
    timestamp: Date.now()
  };
}

function createImageCard(dataUrl, sourceUrl = '') {
  return {
    type: 'image',
    content: dataUrl,
    position: randomPosition(),
    sourceUrl,
    isEmpty: false,
    timestamp: Date.now()
  };
}

// Process image: fetch, resize, compress
async function processImage(imageUrl) {
  // Fetch the image
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  // Create ImageBitmap from blob
  const imageBitmap = await createImageBitmap(blob);
  
  // Calculate new dimensions
  let width = imageBitmap.width;
  let height = imageBitmap.height;
  
  if (width > MAX_WIDTH) {
    const ratio = MAX_WIDTH / width;
    width = MAX_WIDTH;
    height = Math.round(height * ratio);
  }
  
  // Use OffscreenCanvas for service worker
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0, width, height);
  
  // Convert to blob then to base64
  const resizedBlob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: COMPRESSION_QUALITY
  });
  
  // Convert blob to base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(resizedBlob);
  });
}

// Show notification
function showNotification(title, message, type = 'success') {
  // For now, just log - can add chrome.notifications if needed
  console.log(`[${type}] ${title}: ${message}`);
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const boardId = await getBoardId();
  
  if (!boardId) {
    // Open popup to set board ID
    console.error('No board ID set. Please set a board URL in the extension popup.');
    // Could show a notification here
    return;
  }
  
  try {
    switch (info.menuItemId) {
      case 'saveImage': {
        if (!info.srcUrl) {
          console.error('No image URL found');
          return;
        }
        
        console.log('Processing image:', info.srcUrl);
        
        // Process and save image
        const dataUrl = await processImage(info.srcUrl);
        const card = createImageCard(dataUrl, info.srcUrl);
        await saveItemToBoard(boardId, card);
        
        console.log('Image saved successfully!');
        break;
      }
      
      case 'saveLink': {
        if (!info.linkUrl) {
          console.error('No link URL found');
          return;
        }
        
        const card = createLinkCard(info.linkUrl);
        await saveItemToBoard(boardId, card);
        
        console.log('Link saved successfully!');
        break;
      }
      
      case 'saveSelection': {
        if (!info.selectionText) {
          console.error('No text selected');
          return;
        }
        
        const card = createTextCard(info.selectionText);
        await saveItemToBoard(boardId, card);
        
        console.log('Text saved successfully!');
        break;
      }
    }
  } catch (error) {
    console.error('Error saving to Linkdump:', error);
  }
});

