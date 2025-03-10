import React from 'react';
import Modal from './Modal';

const OnboardingDialog = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="onboarding-content">
      <h2>Welcome to the Link Dump (please view on web!)</h2>
      <div className="onboarding-steps">
        <div className="step">
          <p>👋 Read more about the thesis behind the project <a href="https://decay.connie.surf" target="_blank">here</a></p>
        </div>
        <div className="step">
          <p>📋 Paste images, links, or text anywhere on the canvas</p>
        </div>
        <div className="step">
          <p>⌛ Your content will age and fade with time</p>
        </div>
        <div className="step">
          <p>✍️ Add handwritten notes with the Empty Card button</p>
        </div>
        <div className="step">
          <p>⏰ If you leave, time will still pass</p>
        </div>
      </div>
      <button onClick={onClose}>Begin</button>
    </Modal>
  );
};

export default OnboardingDialog; 