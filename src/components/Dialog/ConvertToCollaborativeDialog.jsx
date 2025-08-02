// src/components/Dialog/ConvertToCollaborativeDialog.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import '../Dialog/Modal.css';

const ConvertToCollaborativeDialog = ({ isOpen, onClose, onConvert, storage }) => {
  const [customUrl, setCustomUrl] = useState(() => {
    // Generate a random string for initial URL
    return Math.random().toString(36).substring(2, 7);
  });
  const [isUrlAvailable, setIsUrlAvailable] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalUrl, setFinalUrl] = useState('');

  const baseUrl = 'linkdump.connie.surf';

  const handleCustomUrlChange = (e) => {
    // Only allow alphanumeric characters, hyphens, and underscores
    const sanitizedValue = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    setCustomUrl(sanitizedValue);
    setIsUrlAvailable(true); // Reset availability on change
  };

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const newBoardId = await onConvert(customUrl || null);
      setFinalUrl(`${baseUrl}/${newBoardId}`);
      setShowSuccess(true);
    } catch (error) {
      if (error.message === 'URL_TAKEN') {
        setIsUrlAvailable(false);
      } else {
        console.error('Error converting to collaborative:', error);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`https://${baseUrl}/${customUrl}`);
      setHasCopied(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Load or generate URL backhalf when modal opens
  useEffect(() => {
    const loadOrGenerateUrl = async () => {
      if (isOpen) {
        try {
          // Try to get saved URL from IndexedDB
          const savedUrl = await storage.getCustomUrlBackhalf();
          
          if (savedUrl) {
            setCustomUrl(savedUrl);
          } else {
            // Generate a new random URL if none saved
            const randomUrl = Math.random().toString(36).substring(2, 7);
            setCustomUrl(randomUrl);
            // Save the generated URL
            await storage.saveCustomUrlBackhalf(randomUrl);
          }
          
          setIsUrlAvailable(true);
          setIsConverting(false);
          setShowSuccess(false);
          setFinalUrl('');
        } catch (error) {
          console.error('Error loading/generating URL:', error);
        }
      }
    };

    loadOrGenerateUrl();
  }, [isOpen, storage]);

  return (
         <Modal isOpen={isOpen} onClose={onClose}
     title="Create Collaborative Board"
     primaryButton={{
       label: showSuccess ? (hasCopied ? 'Copied!' : 'Copy Link') : (isConverting ? 'Creating Board...' : 'Create Collaborative Board'),
       onClick: showSuccess ? copyToClipboard : handleConvert,
       disabled: !showSuccess && (isConverting || (!isUrlAvailable))
     }}
     >
        <div className="modal-content">
          {!showSuccess ? (
            <>
                <p className="description">Your board will be available at:</p>
                <div className="collaborative-input">
                  <p style={{ color: 'var(--secondary-color)' }}>{baseUrl}/</p>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={handleCustomUrlChange}
                    className={`input-field ${!isUrlAvailable ? 'error' : ''}`}
                    disabled={isConverting}
                  />
                </div>
                {!isUrlAvailable && (
                  <div className="error-message">This URL is already taken. Please try another.</div>
                )}
                <p className="mode-description">Edit the URL to make it more memorable!</p>
            </>
          ) : (
            <>
              <div className="url-success-box">
                https://{baseUrl}/{customUrl}
              </div>
              <p className="mode-description">Your collaborative board is ready!</p>
            </>
          )}
      </div>
    </Modal>
  );
};

export default ConvertToCollaborativeDialog;