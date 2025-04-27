const DEFAULT_POSITION = { x: 100, y: 100 };

export const createNewCard = (type, content, position = DEFAULT_POSITION, options = {}) => {
  const cardPosition = position && typeof position === 'object'
    ? { x: position.x || DEFAULT_POSITION.x, y: position.y || DEFAULT_POSITION.y }
    : DEFAULT_POSITION;

  return {
    type,
    content,
    position: cardPosition,
    sourceUrl: options.sourceUrl || '',
    isEmpty: options.isEmpty ?? false,
    timestamp: Date.now(),
    ...options
  };
};

export const createImageCard = (dataUrl, position, sourceUrl = '') => {
  return createNewCard('image', dataUrl, position, { sourceUrl });
};

export const createTextCard = (text, position, isEmpty = false) => {
  return createNewCard('newText', text, position, { isEmpty });
};

export const createLinkCard = (url, position) => {
  return createNewCard('link', url, position);
}; 