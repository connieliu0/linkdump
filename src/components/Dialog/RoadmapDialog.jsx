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
        <p>Stay connected by filling out this <a href="https://docs.google.com/forms/d/e/1FAIpQLScCG7CZkm6JVju3iHANitU1XkBrLCMZC066pjQN_HCYSuBXmg/viewform?usp=header" target="_blank" rel="noopener noreferrer">
           form
        </a></p>
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
          <li>Javascript bookmarklet (?) for adding screenshots with source</li>
          <li>Areas to group cards</li>
        </ul>
      </div>
    </Modal>
  );
};

export default RoadmapDialog; 