import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { handleImageFile, extractImageFromClipboard, processImage } from '../../utils/imageProcessing';
import { detectImageSource } from '../../utils/linkProcessing';
import { createImageCard, createTextCard, createLinkCard } from '../../utils/cardManagement';

const AddContentDialog = ({ isOpen, onClose, onAddContent, mode = 'text', imageDataUrl: externalImageDataUrl }) => {
  const [textValue, setTextValue] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState(externalImageDataUrl || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [ref, bounds] = useMeasure();

  useEffect(() => {
    setImageDataUrl(externalImageDataUrl || null);
  }, [externalImageDataUrl]);

  useEffect(() => {
    if (isOpen && mode === 'text' && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          console.log('Focusing from AddContentDialog:', textareaRef.current);
          textareaRef.current.focus();
        }
      }, 500);
    }
  }, [isOpen, mode]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    setTextValue(newValue);
    setError('');
  };

  const handleTextPaste = async (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    const imageItem = extractImageFromClipboard(clipboardData);
    
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      const sourceUrl = await detectImageSource(clipboardData);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const processedDataUrl = await processImage(reader.result);
          setImageDataUrl(processedDataUrl);
          setTextValue('');
          setError('');
        } catch (err) {
          setError('Failed to process image file.');
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const processedDataUrl = await processImage(reader.result);
        setImageDataUrl(processedDataUrl);
        setTextValue('');
        setError('');
      } catch (err) {
        setError('Failed to process image file.');
        setImageDataUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
      setImageDataUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    if (file && file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else if (file) {
      setError('Please select a valid image file.');
    }
  };

  const handleAddClick = () => {
    if (imageDataUrl) {
      onAddContent({ 
        type: 'image', 
        content: imageDataUrl,
        sourceUrl: textValue.trim()
      });
      resetState();
    } else if (textValue.trim()) {
      const trimmedText = textValue.trim();
      const isUrl = /^(https?:\/\/[^\s]+)$/.test(trimmedText);
            
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

  // Handler for focusing textarea after animation
  const handleTextViewAnimationComplete = () => {
    if (isOpen && mode === 'text' && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      className="add-content-dialog" 
      title={mode === 'image' ? 'Add Image' : 'Add Content'}
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

            {mode === 'image' ? (
              <>
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
                          ref={textareaRef}
                          id="add-content-textarea"
                          autoFocus
                          value={textValue}
                          onChange={handleTextChange}
                          placeholder="Write caption..."
                          rows={2}
                          style={{ width: '100%', resize: 'vertical' }}
                        />
                      </motion.div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </>
            ) : (
              <motion.div
                key="text-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onAnimationComplete={handleTextViewAnimationComplete}
              >
                <textarea
                  ref={textareaRef}
                  id="add-content-textarea"
                  autoFocus
                  value={textValue}
                  onChange={handleTextChange}
                  onPaste={handleTextPaste}
                  placeholder="Type text or link..."
                  rows={4}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </MotionConfig>
    </Modal>
  );
};

export default AddContentDialog; 