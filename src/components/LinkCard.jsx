// src/components/LinkCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchMetadata, getBaseDomain } from '../utils/urlMetadata';

const LinkCard = React.memo(function LinkCard({ url, itemId, initialMetadata, storage }) {
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
        if (storage) {
          await storage.updateItem(itemId, {
            metadata: {
              ...data,
              title: data.title ?? '',
              description: data.description ?? ''
            }
          });
        }
      } catch (error) {
        console.error('Error in LinkCard:', error);
        setMetadata({
          title: url ?? '',
          isLoading: false
        });
      }
    };

    getMetadata();
  }, [url, itemId, initialMetadata, storage]);

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
          <a href={url}></a>
      </div>
    );
  }

  // If it's an Instagram post URL, render the Instagram embed
  if (url.match(/instagram\.com\/p\//) || url.match(/instagram\.com\/reel\//)) {
    return (
      <div className="link-card instagram-card">
        <iframe
          src={`https://www.instagram.com/p/${url.split('/p/')[1]?.split('/')[0]}/embed`}
          width="100%"
          height="400"
          scrolling="no"
          allowTransparency={true}
          allow="encrypted-media"
          title="Instagram Post Preview"
          style={{ border: 'none', borderRadius: '12px', background: 'white', padding: '6px'}}
        ></iframe>
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
});

export default LinkCard;