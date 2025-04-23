import React from 'react';
import Modal from './Modal';

const OnboardingDialog = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="onboarding-content"
      title="Welcome to the Link Dump"
      primaryButton={{
        label: "Begin",
        onClick: onClose
      }}
    >
      <div className="dialog-body">
        <div className="onboarding-steps">
          <div className="step">
            <p>👋 Read more about the project <a href="https://decay.connie.surf" target="_blank" rel="noopener noreferrer">here</a></p>
          </div>
          <div className="step">
            <p>📋 Paste images, links, or text on the canvas</p>
          </div>
          <div className="step">
            <p>⌛ Your content will age and fade with time</p>
          </div>
          <div className="step">
            <p>✍️ Add your own notes with empty cards</p>
          </div>
          <div className="step">
            <p>⏰ If you leave, time will still pass</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingDialog; 