import React from 'react';
import Modal from './Modal';

const RoadmapDialog = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="onboarding-content"
    >
      <div>
        <h2>Roadmap</h2>
        <div className="onboarding-steps">
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
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => onClose()}
            style={{
              cursor: 'pointer',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #000',
              borderRadius: '4px',
              fontSize: '14px',
              pointerEvents: 'auto'
            }}
            className="modal-button"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RoadmapDialog; 