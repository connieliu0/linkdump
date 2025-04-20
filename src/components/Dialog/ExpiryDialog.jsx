import React from 'react';
import Modal from './Modal';
import { useExport } from '../../hooks/useExport';

const ExpiryDialog = ({ onRestart, panzoomRef, isOpen }) => {
  const handleExport = useExport(panzoomRef);

  const handleRestartClick = (e) => {
    e.stopPropagation();
    onRestart();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      preventBackdropClick={true}
      title="Time's Up!"
      description="The sun has set, your work has decayed. If you'd like to save, you can always export your work for local storage, or start anew..."
      primaryButton={{
        label: "New Session",
        onClick: handleRestartClick
      }}
      secondaryButton={{
        label: "Export",
        onClick: handleExport
      }}
    />
  );
};

export default ExpiryDialog;