// src/utils/sectionUtils.js

// Default card dimensions for bounds checking when actual dimensions aren't available
const DEFAULT_CARD_WIDTH = 200;
const DEFAULT_CARD_HEIGHT = 150;

/**
 * Check if a card is fully inside a section's bounds
 * @param {Object} card - Card object with position {x, y}
 * @param {Object} section - Section object with bounds {x, y, width, height}
 * @param {Object} cardDimensions - Optional {width, height} of the card
 * @returns {boolean}
 */
export const isCardFullyInsideSection = (card, section, cardDimensions = null) => {
  if (!card?.position || !section?.bounds) return false;
  
  const cardWidth = cardDimensions?.width || DEFAULT_CARD_WIDTH;
  const cardHeight = cardDimensions?.height || DEFAULT_CARD_HEIGHT;
  
  const cardLeft = card.position.x;
  const cardRight = card.position.x + cardWidth;
  const cardTop = card.position.y;
  const cardBottom = card.position.y + cardHeight;
  
  const sectionLeft = section.bounds.x;
  const sectionRight = section.bounds.x + section.bounds.width;
  const sectionTop = section.bounds.y;
  const sectionBottom = section.bounds.y + section.bounds.height;
  
  return (
    cardLeft >= sectionLeft &&
    cardRight <= sectionRight &&
    cardTop >= sectionTop &&
    cardBottom <= sectionBottom
  );
};

/**
 * Get all cards that are fully inside a section
 * @param {Array} cards - Array of card objects
 * @param {Object} section - Section object with bounds
 * @param {Map} cardDimensionsMap - Optional map of cardId -> {width, height}
 * @returns {Array} Cards inside the section
 */
export const getCardsInSection = (cards, section, cardDimensionsMap = null) => {
  if (!cards || !section) return [];
  
  return cards.filter(card => {
    const dimensions = cardDimensionsMap?.get(card.id) || null;
    return isCardFullyInsideSection(card, section, dimensions);
  });
};

/**
 * Find which section a card belongs to (first matching section)
 * @param {Object} card - Card object
 * @param {Array} sections - Array of section objects
 * @param {Object} cardDimensions - Optional card dimensions
 * @returns {Object|null} The section the card is in, or null
 */
export const findSectionForCard = (card, sections, cardDimensions = null) => {
  if (!card || !sections || sections.length === 0) return null;
  
  return sections.find(section => 
    isCardFullyInsideSection(card, section, cardDimensions)
  ) || null;
};

/**
 * Assign sections to all cards for export
 * @param {Array} cards - Array of card objects
 * @param {Array} sections - Array of section objects
 * @param {Map} cardDimensionsMap - Optional map of cardId -> {width, height}
 * @returns {Map} Map of cardId -> sectionName (or null if ungrouped)
 */
export const assignSectionsToCards = (cards, sections, cardDimensionsMap = null) => {
  const assignments = new Map();
  
  cards.forEach(card => {
    const dimensions = cardDimensionsMap?.get(card.id) || null;
    const section = findSectionForCard(card, sections, dimensions);
    assignments.set(card.id, section?.name || null);
  });
  
  return assignments;
};

/**
 * Group cards by their sections for export
 * @param {Array} cards - Array of card objects
 * @param {Array} sections - Array of section objects
 * @param {Map} cardDimensionsMap - Optional map of cardId -> {width, height}
 * @returns {Object} { sectionName: [cards], 'Ungrouped': [cards] }
 */
export const groupCardsBySections = (cards, sections, cardDimensionsMap = null) => {
  const groups = {
    'Ungrouped': []
  };
  
  // Initialize groups for each section
  sections.forEach(section => {
    groups[section.name] = [];
  });
  
  // Assign each card to a group
  cards.forEach(card => {
    const dimensions = cardDimensionsMap?.get(card.id) || null;
    const section = findSectionForCard(card, sections, dimensions);
    
    if (section) {
      groups[section.name].push(card);
    } else {
      groups['Ungrouped'].push(card);
    }
  });
  
  return groups;
};

/**
 * Calculate which cards should move with a section when it's dragged
 * @param {Object} section - The section being dragged
 * @param {Array} cards - All cards
 * @param {Map} cardDimensionsMap - Optional card dimensions map
 * @returns {Array} Card IDs that should move with the section
 */
export const getCardsToMoveWithSection = (section, cards, cardDimensionsMap = null) => {
  const cardsInSection = getCardsInSection(cards, section, cardDimensionsMap);
  return cardsInSection.map(card => card.id);
};

/**
 * Update card positions when a section moves
 * @param {Array} cards - All cards
 * @param {Array} cardIdsToMove - IDs of cards to move
 * @param {Object} delta - Movement delta {x, y}
 * @returns {Array} Updated cards array
 */
export const moveCardsWithSection = (cards, cardIdsToMove, delta) => {
  return cards.map(card => {
    if (cardIdsToMove.includes(card.id)) {
      return {
        ...card,
        position: {
          x: card.position.x + delta.x,
          y: card.position.y + delta.y
        }
      };
    }
    return card;
  });
};

/**
 * Normalize section bounds to ensure positive width/height
 * (handles drawing from any direction)
 * @param {Object} start - Start point {x, y}
 * @param {Object} end - End point {x, y}
 * @returns {Object} Normalized bounds {x, y, width, height}
 */
export const normalizeSectionBounds = (start, end) => {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  
  return { x, y, width, height };
};

