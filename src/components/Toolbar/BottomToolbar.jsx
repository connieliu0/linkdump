import React, { useState, useEffect } from 'react';
import RoadmapDialog from '../Dialog/RoadmapDialog';
import AddContentDialog from '../Dialog/AddContentDialog';
import ImportArenaDialog from '../Dialog/ImportArenaDialog';
import { formatTimeRemaining, getTimePhase, getTimeMessage } from '../../utils/timeFormatting';
import LinesSvg from '../../assets/Lines.svg';
import { motion, AnimatePresence } from 'framer-motion';


const BottomToolbar = ({ 
  boardId,
  onAddEmptyCard,
  onImportArenaItems,
  isCollaborative
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [addContentMode, setAddContentMode] = useState('text');
  const [showImportArena, setShowImportArena] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const fileInputRef = React.useRef(null);

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 5, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } }
  };

  useEffect(() => {
    // Small delay to ensure the initial render is complete
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?board=${boardId}`;
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
        <div className="action import-section">
          <div className="clickable-div import-arena" onClick={() => setShowImportArena(true)}>Import Are.na</div>
        </div>
        <div className="action add-section">
          <div className="clickable-div add-text" onClick={() => { setAddContentMode('text'); setShowAddContentModal(true); }}>
            Add text
            <img src={LinesSvg} alt="" className="lines-svg" />
          </div>
        </div>
        <div className="action add-section">
          <div className="clickable-div add-image" onClick={handleAddImageClick}>
            Add image
            <div style={{ 
              width: '100%', 
              maxWidth: '200px', 
              height: '200px', 
              backgroundColor: 'rgba(0, 0, 0, 0.2)', 
              margin: '4px auto 0 auto' 
            }} />
          </div>
        </div>
        {isCollaborative && (
          <div className="action share-section">
            <div className="clickable-div share-board" onClick={handleShare}>
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="copied"
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    ✓ Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="share"
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    Share board
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
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