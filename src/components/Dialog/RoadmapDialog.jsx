import React from 'react';
import Modal from './Modal';

const RoadmapDialog = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Roadmap"
      preventBackdropClick={false}
      hasOverlay={true}
    >
      <div className="step" style={{ transform: 'rotate(-1deg)' }}>
        <p>Coming Soon</p>
        <ul>
          <li>More details in the decay</li>
          <li>Fix text cards editing functionality
          </li>
        </ul>
      </div>
      <div className="step" style={{ transform: 'rotate(0.5deg)' }}>
        <p>Future Features</p>
        <ul>
          <li>Chrome extension for adding pages more easily</li>
          <li>Optional user accounts for cross device syncing</li>
          <li>Areas to group cards</li>
        </ul>
      </div>
    </Modal>
  );
};

export default RoadmapDialog; 