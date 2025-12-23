# Separate Feature Implementation Guide

This document explains how to implement the "separate" feature that breaks multi-line pasted text into individual cards.

## 1. Detect Line Breaks on Paste (`PasteArea.jsx`)

When text is pasted, check if it contains line breaks and mark the card as separable:

```javascript
const text = clipboardData.getData('text');
if (text) {
  const isUrl = /^(https?:\/\/[^\s]+)$/.test(text);
  const hasLineBreaks = /\r?\n/.test(text);  // Check for line breaks
  const newItem = isUrl
    ? createLinkCard(text, { x, y })
    : createTextCard(text, { x, y }, false, { canSeparate: hasLineBreaks });  // Pass flag
  await saveAndUpdateItems(storage, newItem, setItems);
}
```

## 2. Update `createTextCard` to Accept Options (`cardManagement.js`)

```javascript
export const createTextCard = (text, position, isEmpty = false, options = {}) => {
  return createNewCard('newText', text, position, { isEmpty, ...options });
};
```

## 3. Add the Separate Handler (`PasteArea.jsx`)

```javascript
const handleSeparateCard = useCallback(async (cardId) => {
  if (!storage) return;

  const card = items.find(item => item.id === cardId);
  if (!card) return;

  // Split by line breaks, filter empty lines
  const lines = (card.content || '').split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) return;

  const basePosition = card.position || { x: 100, y: 100 };
  const cardSpacing = 350;  // Horizontal spacing between new cards

  // Create new cards for each line
  for (let i = 0; i < lines.length; i++) {
    const newPosition = {
      x: basePosition.x + (i * cardSpacing),
      y: basePosition.y
    };
    const newCard = createTextCard(lines[i], newPosition, false);
    await saveAndUpdateItems(storage, newCard, setItems);
  }
  
  // Delete the original card
  await deleteAndRemoveItem(storage, cardId, setItems);
}, [storage, items, setItems]);
```

## 4. Pass Props to TextCard (`PasteArea.jsx`)

When rendering TextCard, pass the `canSeparate` flag and handler:

```javascript
<TextCard
  // ... other props
  canSeparate={item.canSeparate || false}
  onSeparate={() => handleSeparateCard(item.id)}
/>
```

## 5. Add the Button in TextCard (`TextCard.jsx`)

Accept the new props and render a button:

```javascript
// Add to props
const TextCard = ({ canSeparate, onSeparate, /* ...other props */ }) => {
  // ...
  
  return (
    <div className="text-container">
      {canSeparate && onSeparate && (
        <button
          onClick={(e) => {
            e.stopPropagation();  // Prevent card selection/drag
            e.preventDefault();
            onSeparate();
          }}
          className="separate-button"
        >
          separate
        </button>
      )}
      {/* rest of card content */}
    </div>
  );
};
```

## 6. Style the Button (`components.css`)

```css
.separate-button {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 4px 12px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  cursor: pointer;
  z-index: 100;
}
```

---

## Key Insight

The button works because it calls `e.stopPropagation()` on its own click handler, which prevents the click from interfering with PanZoom's drag/selection. The rest of the card should **NOT** stop propagation so PanZoom can handle dragging normally.

