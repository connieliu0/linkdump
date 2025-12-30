# Linkdump Chrome Extension

Save pages, text, and images to your Linkdump board directly from your browser.

## Features

- **Save Current Page**: Click the extension icon and save the current page URL
- **Save Text**: Type or paste text/URLs in the popup
- **Right-click Images**: Save any image to your board
- **Right-click Links**: Save any link to your board  
- **Right-click Selection**: Save selected text to your board
- **Remembers Board**: Your board URL is saved until you clear it

## Setup

### 1. Configure Firebase

Edit `firebase-config.js` and `background.js` - replace the placeholder config with your actual Firebase values:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

You can find these values in your main app's `.env` file or in the Firebase Console.

### 2. Add Icons

Create icon PNG files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can convert your existing `logo.ico` using an online converter or create new icons.

### 3. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension icon should appear in your toolbar

## Usage

1. Click the extension icon
2. Enter your board URL (e.g., `linkdump.app/abc12` or just `abc12`)
3. Use "Save Current Page" to save the current tab's URL
4. Or type/paste text in the text area and click "Save Text"
5. Right-click any image and select "Save image to Linkdump"
6. Right-click any link and select "Save link to Linkdump"
7. Select text, right-click, and select "Save selection to Linkdump"

## Troubleshooting

### "No board connected"
Make sure you've entered a valid board ID in the popup.

### Images not saving
- Check the browser console (right-click extension icon > Inspect popup) for errors
- Some images may be blocked by CORS policies
- Make sure your Firebase config is correct

### Firebase errors
- Verify your Firebase config values are correct
- Check that your Firebase Realtime Database rules allow writes








