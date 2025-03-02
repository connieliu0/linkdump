import React from 'react';

const OnboardingDialog = ({ onClose }) => {
  return (
    <div className="dialog-overlay">
      <div className="dialog-content onboarding-content">
        <h2>Welcome to Link Pile (please view on web!)</h2>
        <div className="onboarding-steps">
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
      </div>
    </div>
  );
};

export default OnboardingDialog; 