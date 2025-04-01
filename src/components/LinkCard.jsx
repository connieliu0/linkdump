// src/components/LinkCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../utils/storage';
import { fetchMetadata, getBaseDomain } from '../utils/urlMetadata';

const LinkCard = ({ url, itemId, initialMetadata }) => {
  const [metadata, setMetadata] = useState(initialMetadata || {});
  const domain = getBaseDomain(url);
  const tweetRef = useRef(null);

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

  useEffect(() => {
    // Check if it's a Twitter URL
    if (url.includes('twitter.com') || url.includes('x.com')) {
      // Create tweet embed
      if (window.twttr && tweetRef.current) {
        window.twttr.widgets.load(tweetRef.current);
      }
    }
  }, [url]);

  // If it's a Twitter URL, render the tweet embed
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return (
      <div className="link-card tweet-card" ref={tweetRef}>
        <blockquote className="twitter-tweet">
          <a href={url}></a>
        </blockquote>
      </div>
    );
  }

  // Regular link card for non-Twitter URLs
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