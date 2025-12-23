import { saveItemToBoard, createLinkCard, createTextCard, randomPosition } from './firebase-config.js';

// DOM elements
const boardUrlInput = document.getElementById('boardUrl');
const clearBoardBtn = document.getElementById('clearBoard');
const boardStatus = document.getElementById('boardStatus');
const savePageBtn = document.getElementById('savePageBtn');
const textInput = document.getElementById('textInput');
const saveTextBtn = document.getElementById('saveTextBtn');
const toast = document.getElementById('toast');

// State
let currentBoardId = null;

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

// Update UI based on board connection status
function updateBoardStatus() {
  if (currentBoardId) {
    boardStatus.textContent = `Connected to: ${currentBoardId}`;
    boardStatus.classList.add('connected');
    savePageBtn.disabled = false;
    saveTextBtn.disabled = !textInput.value.trim();
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

// Event: Save text
saveTextBtn.addEventListener('click', async () => {
  if (!currentBoardId || !textInput.value.trim()) return;
  
  saveTextBtn.classList.add('loading');
  saveTextBtn.disabled = true;
  
  try {
    const text = textInput.value.trim();
    const isUrl = /^https?:\/\/[^\s]+$/.test(text);
    
    const card = isUrl 
      ? createLinkCard(text, randomPosition())
      : createTextCard(text, randomPosition());
    
    await saveItemToBoard(currentBoardId, card);
    
    textInput.value = '';
    showToast(isUrl ? 'Link saved!' : 'Text saved!', 'success');
  } catch (error) {
    console.error('Error saving text:', error);
    showToast('Failed to save', 'error');
  } finally {
    saveTextBtn.classList.remove('loading');
    updateBoardStatus();
  }
});

// Initialize on load
init();


