import React, { useState, useEffect } from 'react';
import AddContentDialog from '../Dialog/AddContentDialog';
import ImportArenaDialog from '../Dialog/ImportArenaDialog';
import LinesSvg from '../../assets/Lines.svg';
import PictureSvg from '../../assets/picture.svg';
import Tooltip from '../Tooltip';
import { isMobileDevice } from '../../utils/deviceDetection';


const BottomToolbar = ({ 
  boardId,
  onAddEmptyCard,
  onStartPlacingCard,
  onDragStartPlacingCard,
  onImportArenaItems,
  isCollaborative,
  onConvertToCollaborative,
  storageMode,
  onAddSection,
  isDrawingSection
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [addContentMode, setAddContentMode] = useState('text');
  const [showImportArena, setShowImportArena] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    // Small delay to ensure the initial render is complete
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${boardId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddContent = (content) => {
    if (content.type === 'text') {
      onAddEmptyCard({ content: content.content, type: 'newText', isEmpty: false });
    } else if (content.type === 'image') {
      onAddEmptyCard({ content: content.content, type: 'image', sourceUrl: content.sourceUrl });
    }
  };

  const handleImportArena = (items) => {
    if (onImportArenaItems) {
      onImportArenaItems(items);
    }
    setShowImportArena(false);
  };

  const handleAddImageClick = () => {
    setAddContentMode('image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageDataUrl(reader.result);
      setShowAddContentModal(true);
    };
    if (file && file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    }
  };

  const handleAddTextClick = () => {
    if (isMobileDevice()) {
      // Mobile: show modal
      setAddContentMode('text');
      setShowAddContentModal(true);
    } else {
      // Desktop: start placement mode
      if (onStartPlacingCard) {
        onStartPlacingCard();
      }
    }
  };

  const handleAddTextMouseDown = (e) => {
    // Only handle left mouse button and desktop
    if (e.button !== 0 || isMobileDevice()) return;
    
    // Start drag placement mode
    if (onDragStartPlacingCard) {
      onDragStartPlacingCard();
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className={`toolbar bottom-toolbar${isVisible ? ' visible' : ''}`}>
        {/* Import Arena */}
        <div className="action import-section">
          <div className="clickable-div import-arena" onClick={() => setShowImportArena(true)}>
            Import ✶✶
          </div>
        </div>
        
        {/* Add Text */}
        <div className="action add-section">
          <Tooltip text="Add text">
            <div 
              className="clickable-div add-text" 
              onClick={handleAddTextClick}
              onMouseDown={handleAddTextMouseDown}
            >
              <img 
                src={LinesSvg} 
                alt="" 
                className="lines-svg" 
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          </Tooltip>
        </div>
        
        {/* Add Image */}
        <div className="action add-section">
          <Tooltip text="Add image">
            <div className="clickable-div add-image" onClick={handleAddImageClick}>
              <img src={PictureSvg} alt="" className="picture-svg" />
            </div>
          </Tooltip>
        </div>
        
        {/* Add Section */}
        <div className="action section-tool">
          <Tooltip text="Add section">
            <div 
              className={`clickable-div add-section-btn ${isDrawingSection ? 'active' : ''}`}
              onClick={onAddSection}
            >
            </div>
          </Tooltip>
        </div>
      </div>
      <AddContentDialog 
        isOpen={showAddContentModal} 
        onClose={() => { setShowAddContentModal(false); setImageDataUrl(null); }}
        onAddContent={handleAddContent}
        mode={addContentMode}
        imageDataUrl={imageDataUrl}
      />
      <ImportArenaDialog
        isOpen={showImportArena}
        onClose={() => setShowImportArena(false)}
        onImport={handleImportArena}
      />
    </>
  );
};

export default BottomToolbar;