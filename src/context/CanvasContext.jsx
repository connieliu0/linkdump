import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define Card structure based on the existing card structure
// Card: {
//   id: string,
//   type: string, // 'image', 'newText', 'link'
//   content: string,
//   position: { x: number, y: number },
//   sourceUrl: string,
//   isEmpty: boolean,
//   timestamp: number
// }

// Define Group structure (placeholder for future grouping functionality)
// Group: {
//   id: string,
//   name: string,
//   position: { x: number, y: number },
//   cards: string[] // Array of card IDs
// }

// CanvasState structure:
// {
//   cards: Card[],
//   groups: Group[],
//   canvasTransform: { x: number, y: number, scale: number },
//   selectedItems: string[],
//   isDragging: boolean,
//   dragTarget: string | null,
//   dragType: string | null,
//   isInputActive: boolean,
//   mousePosition: { x: number, y: number }
// }

const canvasReducer = (state, action) => {
  console.log('CanvasContext - State update:', action.type, action.payload);
  
  switch (action.type) {
    case "ADD_CARD":
      return { 
        ...state, 
        cards: [...state.cards, action.payload] 
      };
    
    case "UPDATE_CARD":
      return {
        ...state,
        cards: state.cards.map(card => 
          card.id === action.payload.id 
            ? { ...card, ...action.payload.updates }
            : card
        )
      };
    
    case "DELETE_CARD":
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload),
        selectedItems: state.selectedItems.filter(id => id !== action.payload)
      };
    
    case "START_DRAG":
      return {
        ...state,
        isDragging: true,
        dragTarget: action.payload.target,
        dragType: action.payload.type,
      };

    case "END_DRAG":
      return {
        ...state,
        isDragging: false,
        dragTarget: null,
        dragType: null,
      };

    case "SELECT_CARD":
      return {
        ...state,
        cards: state.cards.map(card => ({
          ...card,
          selected: card.id === action.payload,
          editing: false,
        }))
      };

    case "DESELECT_ALL":
      return {
        ...state,
        cards: state.cards.map(card => ({ ...card, selected: false, editing: false }))
      };
    
    case "ADD_GROUP":
      return {
        ...state,
        groups: [...state.groups, { ...action.payload, id: crypto.randomUUID() }]
      };
    
    case "UPDATE_GROUP":
      return {
        ...state,
        groups: state.groups.map(group => 
          group.id === action.payload.id 
            ? { ...group, ...action.payload.updates }
            : group
        )
      };
    
    case "DELETE_GROUP":
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload)
      };
    
    case "SET_TRANSFORM":
      return {
        ...state,
        canvasTransform: action.payload
      };
    
    case "SET_SELECTION":
      return {
        ...state,
        selectedItems: action.payload
      };
    
    case "SET_DRAGGING":
      return {
        ...state,
        isDragging: action.payload
      };
    
    case "SET_INPUT_ACTIVE":
      return {
        ...state,
        isInputActive: action.payload
      };
    
    case "SET_MOUSE_POSITION":
      return {
        ...state,
        mousePosition: action.payload
      };
    
    case "SET_CARDS":
      return {
        ...state,
        cards: action.payload
      };
    
    case "SET_GROUPS":
      return {
        ...state,
        groups: action.payload
      };
    
    case "CLEAR_CANVAS":
      return {
        ...state,
        cards: [],
        groups: [],
        selectedItems: []
      };
    
    default:
      return state;
  }
};

const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [state, dispatch] = useReducer(canvasReducer, {
    cards: [],
    groups: [],
    canvasTransform: { x: 0, y: 0, scale: 0.7 },
    selectedItems: [],
    isDragging: false,
    dragTarget: null,
    dragType: null,
    isInputActive: false,
    mousePosition: { x: 0, y: 0 }
  });

  // Auto-save to localStorage with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('CanvasContext - Auto-saving to localStorage:', {
        cards: state.cards.length,
        groups: state.groups.length,
        canvasTransform: state.canvasTransform
      });
      localStorage.setItem('canvas-data', JSON.stringify({
        cards: state.cards,
        groups: state.groups,
        canvasTransform: state.canvasTransform
      }));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [state.cards, state.groups, state.canvasTransform]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('canvas-data');
      if (savedData) {
        console.log('CanvasContext - Loading from localStorage:', savedData);
        const parsed = JSON.parse(savedData);
        if (parsed.cards) {
          console.log('CanvasContext - Loading cards:', parsed.cards.length);
          dispatch({ type: "SET_CARDS", payload: parsed.cards });
        }
        if (parsed.groups) {
          console.log('CanvasContext - Loading groups:', parsed.groups.length);
          dispatch({ type: "SET_GROUPS", payload: parsed.groups });
        }
        if (parsed.canvasTransform) {
          console.log('CanvasContext - Loading transform:', parsed.canvasTransform);
          dispatch({ type: "SET_TRANSFORM", payload: parsed.canvasTransform });
        }
      } else {
        console.log('CanvasContext - No saved data found in localStorage');
      }
    } catch (error) {
      console.error('CanvasContext - Failed to load canvas data from localStorage:', error);
    }
  }, []);

  return (
    <CanvasContext.Provider value={{ state, dispatch }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) throw new Error('useCanvas must be used within CanvasProvider');
  return context;
}; 