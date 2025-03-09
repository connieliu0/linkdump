import React from 'react';
import Modal from './Modal';
import { useExport } from '../hooks/useExport';

const ExpiryDialog = ({ onRestart, panzoomRef, isOpen }) => {
  const handleExport = useExport(panzoomRef);

  const handleRestartClick = (e) => {
    e.stopPropagation();
    onRestart();
  };

  return (
    <Modal isOpen={isOpen} preventBackdropClick>
      <h2>Time's Up!</h2>
      <p>
        The sun has set, your work has decayed. If you'd like to save, you can always export your work for local storage, or start anew...
      </p>
      <div className="button-container">
        <button onClick={handleExport}>
          Export
        </button>
        <button onClick={handleRestartClick}>
          New Session
        </button>
      </div>
    </Modal>
  );
};

export default ExpiryDialog;