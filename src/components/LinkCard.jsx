// src/components/LinkCard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../utils/storage';

const fetchMetadata = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const title = doc.querySelector('title')?.textContent || url;
    return { title };
  } catch (error) {
    return { title: new URL(url).hostname };
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
          isLoading: false
        });
        // Store the metadata in the database
        await db.items.update(itemId, { metadata: data });
      } catch (error) {
        const fallbackData = { title: new URL(url).hostname };
        setMetadata({
          title: fallbackData.title,
          isLoading: false
        });
        await db.items.update(itemId, { metadata: fallbackData });
      }
    };

    getMetadata();
  }, [url, itemId]);

  return (
    <>
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {metadata.title || url}
      </a>
      {metadata.description && (
        <p>{metadata.description}</p>
      )}
    </>
  );
};

export default LinkCard;