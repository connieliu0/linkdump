import React, { useState, useEffect } from 'react';
import RoadmapDialog from '../Dialog/RoadmapDialog';
import AddContentDialog from '../Dialog/AddContentDialog';
import ImportArenaDialog from '../Dialog/ImportArenaDialog';
import { formatTimeRemaining, getTimePhase, getTimeMessage } from '../../utils/timeFormatting';
import LinesSvg from '../../assets/Lines.svg';
import { motion, AnimatePresence } from 'framer-motion';


const Toolbar = ({ 
  timeRemaining,
  timeSettings,
  projectDescription,
  onClearCanvas,
  isExpired,
  boardId,
  onOpenAddContentModal,
  onOpenImportArena,
  onImportArenaItems,
  isCollaborative
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showImportArena, setShowImportArena] = useState(false);
  const [copied, setCopied] = useState(false);

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

  console.log('isCollaborative:', isCollaborative);

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

  return (
    <>
      <div className={`toolbar bottom-toolbar${isVisible ? ' visible' : ''}`}>
      <div className="action import-section">
          <div className="clickable-div import-arena" onClick={() => setShowImportArena(true)}>Import Are.na</div>
      </div>
      <div className="action add-section">
          <div className="clickable-div add-content" onClick={() => setShowAddContentModal(true)}>
            Add content
            <img src={LinesSvg} alt="" className="lines-svg" />
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
        onClose={() => setShowAddContentModal(false)}
        onAddContent={handleAddContent}
      />
      <ImportArenaDialog
        isOpen={showImportArena}
        onClose={() => setShowImportArena(false)}
        onImport={handleImportArena}
      />
    </>
  );
};

export default Toolbar;