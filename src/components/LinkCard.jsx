// src/components/LinkCard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../utils/storage';
import { fetchMetadata, getBaseDomain } from '../utils/urlMetadata';

const LinkCard = ({ url, itemId, initialMetadata }) => {
  const [metadata, setMetadata] = useState(initialMetadata || {});
  const domain = getBaseDomain(url);

  useEffect(() => {
    if (initialMetadata) return;

    const getMetadata = async () => {
      setMetadata(prev => ({ ...prev, isLoading: true }));
      try {
        const data = await fetchMetadata(url);
        setMetadata({ ...data, isLoading: false });
        await db.items.update(itemId, { metadata: data });
      } catch (error) {
        console.error('Error in LinkCard:', error);
        setMetadata({
          title: url,
          isLoading: false
        });
      }
    };

    getMetadata();
  }, [url, itemId, initialMetadata]);

  return (
    <div className="link-card">
      <div className="link-preview">
        {metadata.imageUrl && (
          <div className="link-image-container">
            <img src={metadata.imageUrl} alt="" className="link-preview-image" />
          </div>
        )}
        <div className="link-content">
          <div className="link-header">
            <span className="link-domain">{domain}</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="link-title">
            {metadata.title || url} <span className="external-link-icon">↗</span>
          </a>
          {metadata.description && (
            <p className="link-description">{metadata.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkCard;