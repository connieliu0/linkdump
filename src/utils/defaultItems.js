// src/utils/defaultItems.js
import { createTextCard, createLinkCard } from './cardManagement';

export const getDefaultHomepageItems = () => {
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
    createTextCard(
      "👋 Welcome to Linkdump!\n\n" +
      "This is your personal space for collecting thoughts, links, and images. Here's how to get started:\n\n" +
      "• Paste any URL, image, or text onto the canvas\n" +
      "• Click 'Add text' or 'Add image' at the bottom\n" +
      "• Hold Shift to select and move multiple items\n" +
      "• Watch as your content naturally fades over time",
      { x: CENTER_X - SPACING_X, y: CENTER_Y - SPACING_Y },
    ),

    // About link - top right of center group
    createLinkCard(
      "https://decay.connie.surf",
      { x: CENTER_X + SPACING_X, y: CENTER_Y - SPACING_Y }
    ),

    // Pro tips - bottom left of center group
    createTextCard(
      "💡 Pro Tips:\n\n" +
      "• Import collections from Are.na\n" +
      "• Create collaborative boards to share with others\n" +
      "• Double-click any text to edit\n" +
      "• Press Delete to remove items",
      { x: CENTER_X - SPACING_X, y: CENTER_Y + SPACING_Y },
      false
    ),

    // Time decay info - bottom right of center group
    createTextCard(
      "⏳ Time-based decay\n\n" +
      "Your content will gradually fade over the next week, encouraging you to focus on what matters now.\n\n" +
      "Create something new or let your old thoughts fade away...",
      { x: CENTER_X + SPACING_X, y: CENTER_Y + SPACING_Y },
      false
    )
  ];
};