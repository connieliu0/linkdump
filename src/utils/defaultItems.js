// src/utils/defaultItems.js
import { createTextCard, createLinkCard } from './cardManagement';

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
      "⏳ Time-based decay\n\n" +
      "Your content will gradually fade over the next week, encouraging you to focus on what matters now.\n\n" +
      "Create something new or let your old thoughts fade away...",
      { x: CENTER_X - SPACING_X, y: CENTER_Y - SPACING_Y -20 },
      false
    ),

    // Info card above the About link
    createTextCard(
      "Learn more about the underpinnings of the project",
      { x: CENTER_X + SPACING_X - 240, y: CENTER_Y - SPACING_Y },
      false
    ),
    // About link - top right of center group
    createLinkCard(
      "https://decay.connie.surf",
      { x: CENTER_X + SPACING_X -240, y: CENTER_Y - SPACING_Y +100}
    ),

    // Pro tips - bottom left of center group
    // Pro Tips cards, broken up and moved to the left of the welcome card
    createTextCard(
      "💡 Pro Tips:",
      { x: CENTER_X - SPACING_X * 2, y: CENTER_Y - SPACING_Y },
      false
    ),
    createTextCard(
      "• Import collections from Are.na",
      { x: CENTER_X - SPACING_X * 2 + 20, y: CENTER_Y - SPACING_Y + 60 },
      false
    ),
    createTextCard(
      "• Create collaborative boards to share with others",
      { x: CENTER_X - SPACING_X * 2 - 20, y: CENTER_Y - SPACING_Y + 120 },
      false
    ),

  ];
};