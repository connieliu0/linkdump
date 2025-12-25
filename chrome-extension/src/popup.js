import { saveItemToBoard, createLinkCard, createTextCard, createImageCard, randomPosition } from './firebase-config.js';

// Image processing constants
const MAX_WIDTH = 300;
const COMPRESSION_QUALITY = 0.7;

// DOM elements
const boardUrlInput = document.getElementById('boardUrl');
const clearBoardBtn = document.getElementById('clearBoard');
const boardStatus = document.getElementById('boardStatus');
const savePageBtn = document.getElementById('savePageBtn');
const textInput = document.getElementById('textInput');
const saveTextBtn = document.getElementById('saveTextBtn');
const toast = document.getElementById('toast');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const clearImageBtn = document.getElementById('clearImage');

// State
let currentBoardId = null;
let pendingImageDataUrl = null;

// Extract board ID from URL or raw ID
function extractBoardId(input) {
  if (!input) return null;
  
  // Remove whitespace
  input = input.trim();
  
  // If it's a full URL, extract the path
  try {
    const url = new URL(input);
    // Get the pathname and remove leading slash
    const path = url.pathname.replace(/^\//, '');
    // Return first path segment (the board ID)
    return path.split('/')[0] || null;
  } catch {
    // Not a URL, treat as raw board ID
    // Remove any leading/trailing slashes
    return input.replace(/^\/|\/$/g, '') || null;
  }
}

// Process and compress image
async function processImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            const ratio = MAX_WIDTH / width;
            width = MAX_WIDTH;
            height = Math.round(height * ratio);
          }
          
          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed data URL
          const dataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Update UI based on board connection status
function updateBoardStatus() {
  if (currentBoardId) {
    boardStatus.textContent = `Connected to: ${currentBoardId}`;
    boardStatus.classList.add('connected');
    savePageBtn.disabled = false;
    // Enable save button if there's text OR a pending image
    saveTextBtn.disabled = !textInput.value.trim() && !pendingImageDataUrl;
  } else {
    boardStatus.textContent = 'No board connected';
    boardStatus.classList.remove('connected');
    savePageBtn.disabled = true;
    saveTextBtn.disabled = true;
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Save board ID to storage
async function saveBoardId(boardId) {
  await chrome.storage.local.set({ boardId });
}

// Load board ID from storage
async function loadBoardId() {
  const result = await chrome.storage.local.get(['boardId']);
  return result.boardId || null;
}

// Clear pending image
function clearPendingImage() {
  pendingImageDataUrl = null;
  previewImg.src = '';
  imagePreview.classList.add('hidden');
  updateBoardStatus();
}

// Initialize popup
async function init() {
  // Load saved board ID
  currentBoardId = await loadBoardId();
  
  if (currentBoardId) {
    boardUrlInput.value = currentBoardId;
  }
  
  updateBoardStatus();
}

// Event: Board URL input change
boardUrlInput.addEventListener('input', async (e) => {
  const boardId = extractBoardId(e.target.value);
  currentBoardId = boardId;
  
  if (boardId) {
    await saveBoardId(boardId);
  }
  
  updateBoardStatus();
});

// Event: Clear board
clearBoardBtn.addEventListener('click', async () => {
  boardUrlInput.value = '';
  currentBoardId = null;
  await chrome.storage.local.remove(['boardId']);
  updateBoardStatus();
});

// Event: Save current page
savePageBtn.addEventListener('click', async () => {
  if (!currentBoardId) return;
  
  savePageBtn.classList.add('loading');
  savePageBtn.disabled = true;
  
  try {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.url) {
      throw new Error('Could not get current page URL');
    }
    
    const card = createLinkCard(tab.url, randomPosition());
    await saveItemToBoard(currentBoardId, card);
    
    showToast('Page saved!', 'success');
  } catch (error) {
    console.error('Error saving page:', error);
    showToast('Failed to save page', 'error');
  } finally {
    savePageBtn.classList.remove('loading');
    updateBoardStatus();
  }
});

// Event: Text input change
textInput.addEventListener('input', () => {
  updateBoardStatus();
});

// Event: Paste (handle images)
textInput.addEventListener('paste', async (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      
      const file = item.getAsFile();
      if (!file) continue;
      
      try {
        const dataUrl = await processImage(file);
        pendingImageDataUrl = dataUrl;
        previewImg.src = dataUrl;
        imagePreview.classList.remove('hidden');
        updateBoardStatus();
        showToast('Image ready to save', 'success');
      } catch (error) {
        console.error('Error processing image:', error);
        showToast('Failed to process image', 'error');
      }
      break;
    }
  }
});

// Event: Clear image button
clearImageBtn.addEventListener('click', () => {
  clearPendingImage();
});

// Event: Save text/image
saveTextBtn.addEventListener('click', async () => {
  if (!currentBoardId) return;
  if (!textInput.value.trim() && !pendingImageDataUrl) return;
  
  saveTextBtn.classList.add('loading');
  saveTextBtn.disabled = true;
  
  try {
    // Save image if present
    if (pendingImageDataUrl) {
      const card = createImageCard(pendingImageDataUrl, randomPosition());
      await saveItemToBoard(currentBoardId, card);
      clearPendingImage();
      showToast('Image saved!', 'success');
    }
    
    // Save text if present
    if (textInput.value.trim()) {
      const text = textInput.value.trim();
      const isUrl = /^https?:\/\/[^\s]+$/.test(text);
      
      const card = isUrl 
        ? createLinkCard(text, randomPosition())
        : createTextCard(text, randomPosition());
      
      await saveItemToBoard(currentBoardId, card);
      textInput.value = '';
      showToast(isUrl ? 'Link saved!' : 'Text saved!', 'success');
    }
  } catch (error) {
    console.error('Error saving:', error);
    showToast('Failed to save', 'error');
  } finally {
    saveTextBtn.classList.remove('loading');
    updateBoardStatus();
  }
});

// Initialize on load
init();
