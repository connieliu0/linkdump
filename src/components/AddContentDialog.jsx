import React, { useState, useRef } from 'react';
import Modal from './Modal'; // Assuming Modal component exists and handles basic modal logic

const AddContentDialog = ({ isOpen, onClose, onAddContent }) => {
  const [textValue, setTextValue] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    setTextValue(e.target.value);
    if (e.target.value && imageDataUrl) {
      // Clear image if user starts typing text
      setImageDataUrl(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
      }
    }
    setError(''); // Clear error on input change
  };

  const handleTextPaste = (e) => {
    // Don't prevent default - let the textarea get the pasted content
    const clipboardData = e.clipboardData || window.clipboardData;
    
    // Check if there's an image in the clipboard
    const hasImage = [...clipboardData.items].some(
      item => item.type.indexOf('image') !== -1
    );

    if (hasImage) {
      e.preventDefault(); // Prevent paste only if it's an image
      const imageItem = [...clipboardData.items].find(
        item => item.type.indexOf('image') !== -1
      );
      
      if (imageItem) {
        const file = imageItem.getAsFile();
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageDataUrl(reader.result);
          setTextValue(''); // Clear text if user pastes image
          setError('');
        };
        reader.onerror = () => {
          setError('Failed to read image from clipboard.');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result);
        setTextValue(''); // Clear text if user uploads image
        setError('');
      };
      reader.onerror = () => {
        setError('Failed to read image file.');
        setImageDataUrl(null);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      setError('Please select a valid image file.');
      setImageDataUrl(null);
       if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
      }
    }
  };

  const handleAddClick = () => {
    if (imageDataUrl) {
      onAddContent({ type: 'image', content: imageDataUrl });
      resetState();
    } else if (textValue.trim()) {
      onAddContent({ type: 'text', content: textValue.trim() });
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
        fileInputRef.current.value = ''; // Reset file input
    }
    onClose(); // Close the modal
  };

  const handleClose = () => {
    resetState(); // Reset state when closing without adding
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="add-content-dialog">
      <h2>Add Content</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <textarea
        value={textValue}
        onChange={handleTextChange}
        onPaste={handleTextPaste}
        placeholder="Paste text, link, or image here..."
        rows={4}
        style={{ width: '100%', marginBottom: '1rem', resize: 'vertical' }}
        disabled={!!imageDataUrl} // Disable text area if image is uploaded
      />

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

      {imageDataUrl && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img 
            src={imageDataUrl} 
            alt="Preview" 
            style={{ maxWidth: '100%', maxHeight: '150px', display: 'block', margin: '0 auto' }} 
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button onClick={handleClose}>Cancel</button>
        <button onClick={handleAddClick}>Add</button>
      </div>
    </Modal>
  );
};

export default AddContentDialog; 