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
        <ul style={{ marginTop: '16px' }}>
          <li><p>New <a href="https://chromewebstore.google.com/detail/linkdump-saver/eemcbhaiifgompigbdjfhklaimdcdndh" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px' }}>chrome extension</a> for easier link saving</p></li>
          <li><p>Sections to mindmap your cards together</p></li>
          <li><p>Separate cards from bulleted list</p></li>
        </ul>
      <div className="button-container" style={{ marginTop: '16px' }}>
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLScCG7CZkm6JVju3iHANitU1XkBrLCMZC066pjQN_HCYSuBXmg/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          style={{ flex: 1, textDecoration: 'none' }}
        >
          <button style={{ width: '100%' }}>Please give feedback! I'll buy you a coffee</button>
        </a>
      </div>
    </Modal>
  );
};

export default ChangelogDialog;

