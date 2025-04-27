import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { handleImageFile, extractImageFromClipboard } from '../../utils/imageProcessing';
import { detectImageSource } from '../../utils/linkProcessing';
import { createImageCard, createTextCard, createLinkCard } from '../../utils/cardManagement';

const AddContentDialog = ({ isOpen, onClose, onAddContent }) => {
  const [textValue, setTextValue] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    setTextValue(e.target.value);
    if (e.target.value && imageDataUrl) {
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
      onAddContent({ type: 'image', content: imageDataUrl });
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
    <Modal isOpen={isOpen} onClose={handleClose} className="add-content-dialog" title="Add Content"
    primaryButton={{
      label: "Add",
      onClick: handleAddClick
    }}
   >
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button onClick={handleImageUploadClick} disabled={!!textValue.trim()}> 
          {imageDataUrl ? 'Change Image' : 'Upload Image'}
        </button>
        {imageDataUrl && (
          <button onClick={() => { setImageDataUrl(null); fileInputRef.current.value = '';}} style={{marginLeft: '10px'}}>
            Clear Image
          </button>
        )}
      </div>
      <textarea
        value={textValue}
        onChange={handleTextChange}
        onPaste={handleTextPaste}
        placeholder="Paste text, link, or image here..."
        rows={4}
        style={{ width: '100%', marginBottom: '1rem', resize: 'vertical' }}
        disabled={!!imageDataUrl}
      />

     

      {imageDataUrl && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img 
            src={imageDataUrl} 
            alt="Preview" 
            style={{ maxWidth: '100%', maxHeight: '150px', display: 'block', margin: '0 auto' }} 
          />
        </div>
      )}

    </Modal>
  );
};

export default AddContentDialog; 