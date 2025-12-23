import React from 'react';
import Modal from './Modal';

const ChangelogDialog = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="What's New"
      preventBackdropClick={false}
      hasOverlay={true}
    >
      <div className="step" style={{ transform: 'rotate(-1deg)' }}>
        <p>Latest Updates</p>
        <ul>
          <li>Sections to group your cards together</li>
          <li>Paste a bullet list and have the option to separate out into individual cards</li>
        </ul>
      </div>
      <div className="step" style={{ transform: 'rotate(0.5deg)' }}>
        <p>Coming Soon</p>
        <ul>
        <li>Better onboarding</li>
          <li>Improved toolbar design</li>
          <li>Chrome extension/app for easier link saving</li>
        </ul>
      </div>
      <div className="button-container" style={{ marginTop: '16px' }}>
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLScCG7CZkm6JVju3iHANitU1XkBrLCMZC066pjQN_HCYSuBXmg/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          style={{ flex: 1, textDecoration: 'none' }}
        >
          <button style={{ width: '100%' }}>Please give feedback!</button>
        </a>
      </div>
    </Modal>
  );
};

export default ChangelogDialog;

