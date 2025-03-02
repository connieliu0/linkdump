// src/components/LinkCard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../utils/storage';

const fetchMetadata = async (url) => {
  try {
    // Option 1: Using allorigins.win as a CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    // Parse the contents from the proxy response
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    // Get metadata
    const title = doc.querySelector('title')?.textContent || url;
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                       doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
    
    return { 
      title,
      description 
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { 
      title: new URL(url).hostname,
      description: null
    };
  }
};

const LinkCard = ({ url, itemId, initialMetadata }) => {
  const [metadata, setMetadata] = useState(initialMetadata || {});

  useEffect(() => {
    const getMetadata = async () => {
      // Skip fetching if we already have metadata
      if (initialMetadata) return;

      setMetadata(prev => ({ ...prev, isLoading: true }));
      try {
        const data = await fetchMetadata(url);
        setMetadata({
          title: data.title,
          description: data.description,
          isLoading: false
        });
        // Store the metadata in the database
        await db.items.update(itemId, { metadata: data });
      } catch (error) {
        const fallbackData = { title: new URL(url).hostname, description: null };
        setMetadata({
          title: fallbackData.title,
          description: fallbackData.description,
          isLoading: false
        });
        await db.items.update(itemId, { metadata: fallbackData });
      }
    };

    getMetadata();
  }, [url, itemId]);

  return (
    <div className="link-card">
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="link-title"
      >
        {metadata.title || url}
      </a>
      {metadata.description && (
        <p className="link-description">{metadata.description}</p>
      )}
    </div>
  );
};

export default LinkCard;