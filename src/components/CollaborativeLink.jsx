import React, { useState } from 'react';

const CollaborativeLink = ({ boardId }) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}?board=${boardId}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="collaborative-link">
      <p>Share this board with others:</p>
      <div className="link-container">
        <code>{shareUrl}</code>
        <button onClick={handleCopy}>
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export default CollaborativeLink; 