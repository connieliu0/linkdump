import React from 'react';

const FirstBoardToolbar = ({ 
  onCreateBoard,
  onMakeCollaborative,
  onClearCanvas
}) => {
  return (
    <div className="first-board-toolbar">
      <div className="first-board-toolbar__buttons">
        <button 
          className="first-board-toolbar__button"
          onClick={onCreateBoard}
        >
          ➕ New board
        </button>
        <button 
          className="first-board-toolbar__button"
          onClick={onMakeCollaborative}
        >
          🔗 Make collaborative
        </button>
        <button 
          className="first-board-toolbar__button"
          onClick={onClearCanvas}
        >
          🗑️ Clear canvas
        </button>
      </div>
    </div>
  );
};

export default FirstBoardToolbar;

