// src/utils/sheetsService.js

// Replace with your deployed Google Apps Script web app URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

/**
 * Sends data to Google Sheets
 * @param {Object} data - The data to send
 * @param {string} data.content - Content (text, URL, or image data URL)
 * @param {string} data.type - Type of content ('text', 'link', or 'image')
 * @param {number} data.x - X position
 * @param {number} data.y - Y position
 * @returns {Promise<Object>} - Result of the operation
 */
export const sendToSheet = async (data) => {
  try {
    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
    return { success: false, error: error.message };
  }
};