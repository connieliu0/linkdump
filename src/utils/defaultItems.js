// src/utils/defaultItems.js
import { createTextCard, createLinkCard, createImageCard } from './cardManagement';
import addToHomepageImage from '../assets/addtohomepage.png';

export const getDefaultHomepageItems = () => {
  console.log('Loading default items');
  // Board dimensions from PasteArea.jsx
  const BOARD_WIDTH = 2160;
  const BOARD_HEIGHT = 1200;

  // Calculate center positions
  const CENTER_X = BOARD_WIDTH / 2;
  const CENTER_Y = BOARD_HEIGHT / 2;

  // Define spacing between cards
  const SPACING_X = 400;
  const SPACING_Y = 250;

  return [
    // Welcome card - top left of center group
    // Main welcome card (no bullets)
    createTextCard(
      "⏳ Your content will fade over the next week " +
      "to then remain as an exportable csv file",
      { x: CENTER_X - 300, y: CENTER_Y - SPACING_Y -20 },
      false
    ),
    createTextCard(
      "🌱 When you're ready, create a new board",
      { x: CENTER_X - 300, y: CENTER_Y - SPACING_Y +110 },
      false
    ),
    // Info card above the About link
    createTextCard(
      "📖 Learn more about project underpinnings ↓",
      { x: CENTER_X + SPACING_X - 240, y: CENTER_Y - SPACING_Y },
      false
    ),
    // About link - top right of center group
    createLinkCard(
      "https://decay.connie.surf",
      { x: CENTER_X + SPACING_X -240, y: CENTER_Y - SPACING_Y +90}
    ),
    createLinkCard(
      "https://connie.surf/valuesbasedsoftware.html",
      { x: CENTER_X + SPACING_X -240, y: CENTER_Y - SPACING_Y +180}
    ),
    // Pro tips - bottom left of center group
    // Pro Tips cards, broken up and moved to the left of the welcome card
    createTextCard(
      "💡 Tips:",
      { x: CENTER_X - SPACING_X * 2, y: CENTER_Y - SPACING_Y },
      false
    ),
    createTextCard(
      "• Import cards from Are.na and sort with sections",
      { x: CENTER_X - SPACING_X * 2 + 20, y: CENTER_Y - SPACING_Y + 60 },
      false
    ),
    createTextCard(
      "• Create collaborative boards to share cross device - add to your board via mobile!",
      { x: CENTER_X - SPACING_X * 2 - 20, y: CENTER_Y - SPACING_Y + 180 },
      false
    ),
    // Chrome extension tip - to the right of tips
    createTextCard(
      "• Save items using the Chrome extension",
      { x: CENTER_X - SPACING_X, y: CENTER_Y - SPACING_Y + 80 },
      false
    ),
    createLinkCard(
      "https://chromewebstore.google.com/detail/linkdump-saver/eemcbhaiifgompigbdjfhklaimdcdndh",
      { x: CENTER_X - SPACING_X, y: CENTER_Y - SPACING_Y + 150 }
    ),

    // Add to Home Screen image card
    createImageCard(
      addToHomepageImage,
      { x: CENTER_X -800, y: CENTER_Y - SPACING_Y + 300 }
    ),

  ];
};