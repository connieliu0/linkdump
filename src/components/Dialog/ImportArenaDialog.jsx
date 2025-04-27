import React, { useState } from 'react';
import { fetchChannelBlocks, convertBlocksToCanvasItems, extractChannelSlug } from '../../utils/arenaService';
import Modal from './Modal';

const ImportArenaDialog = ({ isOpen, onClose, onImport }) => {
  const [channelUrl, setChannelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const slug = extractChannelSlug(channelUrl);
      console.log('Extracted slug:', slug);
      
      if (!slug) {
        throw new Error('Invalid Are.na channel URL or slug');
      }
      
      // Fetch all blocks from the channel
      const blocks = await fetchChannelBlocks(slug);
      
      if (!blocks || blocks.length === 0) {
        throw new Error('No content found in this Are.na channel');
      }
      
      console.log(`Retrieved ${blocks.length} blocks from Are.na`);
      
      // Convert blocks to canvas items format
      const canvasItems = convertBlocksToCanvasItems(blocks);
      
      // Pass to parent component for further processing
      onImport(canvasItems);
      onClose();
      
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import Are.na channel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Import from Are.na</h2>
      <div>
        <label>
          Are.na Channel URL or Slug
          <input
            type="text"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            placeholder="https://www.are.na/channel/example-channel or example-channel"
            className="input-field"
          />
        </label>
        <p className="help-text">
          Paste the URL of an Are.na channel or enter the channel slug directly
        </p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      
      <div className="button-container">
        <button 
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button 
          onClick={handleImport}
          disabled={isLoading || !channelUrl.trim()}
        >
          {isLoading ? 'Importing...' : 'Import Channel'}
        </button>
      </div>
    </Modal>
  );
};

export default ImportArenaDialog;