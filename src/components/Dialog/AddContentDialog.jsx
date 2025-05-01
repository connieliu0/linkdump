import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { handleImageFile, extractImageFromClipboard } from '../../utils/imageProcessing';
import { detectImageSource } from '../../utils/linkProcessing';
import { createImageCard, createTextCard, createLinkCard } from '../../utils/cardManagement';

const AddContentDialog = ({ isOpen, onClose, onAddContent }) => {
  const [textValue, setTextValue] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [ref, bounds] = useMeasure();

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    setTextValue(newValue);
    // If user starts typing and there's an image, clear it
    if (newValue && imageDataUrl) {
      setImageDataUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setError('');
  };

  const handleTextPaste = async (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    const imageItem = extractImageFromClipboard(clipboardData);
    
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      const sourceUrl = await detectImageSource(clipboardData);
      
      handleImageFile(
        file,
        (resizedDataUrl) => {
          setImageDataUrl(resizedDataUrl);
          setTextValue('');
          setError('');
        },
        (errorMessage) => {
          setError(errorMessage);
        }
      );
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleImageFile(
      file,
      (resizedDataUrl) => {
        setImageDataUrl(resizedDataUrl);
        setTextValue('');
        setError('');
      },
      (errorMessage) => {
        setError(errorMessage);
        setImageDataUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    );
  };

  const handleAddClick = () => {
    if (imageDataUrl) {
      onAddContent({ 
        type: 'image', 
        content: imageDataUrl,
        sourceUrl: textValue.trim() // Use text input as source URL for images
      });
      resetState();
    } else if (textValue.trim()) {
      const trimmedText = textValue.trim();
      const isUrl = trimmedText.startsWith('http://') || trimmedText.startsWith('https://');
      
      if (isUrl) {
        onAddContent({ type: 'link', content: trimmedText });
      } else {
        onAddContent({ type: 'text', content: trimmedText });
      }
      resetState();
    } else {
      setError('Please enter text/link or upload an image.');
    }
  };

  const resetState = () => {
    setTextValue('');
    setImageDataUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleClose = () => {
    resetState();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      className="add-content-dialog" 
      title="Add Content"
      primaryButton={{
        label: "Add",
        onClick: handleAddClick
      }}
    >
      <MotionConfig transition={{ duration: 0.5, type: "spring", bounce: 0 }}>
        <motion.div
          animate={{ height: bounds.height > 0 ? bounds.height : 'auto' }}
          style={{ overflow: 'hidden' }}
        >
          <div ref={ref}>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: 'red', marginBottom: '1rem' }}
              >
                {error}
              </motion.p>
            )}

            <div style={{ marginBottom: '1rem', flexDirection: 'row', display:'flex', alignSelf: 'stretch', width: '100%', alignItems:'flex-start'}}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <AnimatePresence>
                {!textValue.trim() && (
                  <motion.button 
                    onClick={handleImageUploadClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    style={{flex: "1 0 0"}}
                  >
                    {imageDataUrl ? 'Change Image' : 'Upload Image'}
                  </motion.button>
                )}
              
                {imageDataUrl && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    onClick={() => { 
                      setImageDataUrl(null); 
                      fileInputRef.current.value = '';
                    }}
                    style={{ marginLeft: imageDataUrl && !textValue.trim() ? '10px' : '0px', flex: "1 0 0"}}
                  >
                    Clear Image
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {imageDataUrl ? (
                <motion.div
                  key="image-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <img 
                      src={imageDataUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '150px', display: 'block', margin: '0 auto' }} 
                    />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2, ease: "easeOut" }}
                  >
                    <textarea
                      value={textValue}
                      onChange={handleTextChange}
                      placeholder="Add image source or description..."
                      rows={2}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="text-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <textarea
                    value={textValue}
                    onChange={handleTextChange}
                    onPaste={handleTextPaste}
                    placeholder="Paste text, link, or image here..."
                    rows={4}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </Modal>
  );
};

export default AddContentDialog; 