// src/components/LinkCard.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchMetadata, getBaseDomain } from '../utils/urlMetadata';
import { useCanvas } from '../context/CanvasContext';
import { useDrag } from '../hooks/useDrag';

const LinkCard = React.memo(function LinkCard({ url, itemId, initialMetadata, storage }) {
  const { state, dispatch } = useCanvas();
  
  // Local state
  const [metadata, setMetadata] = useState(initialMetadata || {});
  const [tweetHtml, setTweetHtml] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Memoize expensive computations
  const domain = useMemo(() => url ? getBaseDomain(url) : '', [url]);
  const isTwitterUrl = useMemo(() => url && (url.includes('twitter.com') || url.includes('x.com')), [url]);
  const isInstagramUrl = useMemo(() => url && (url.match(/instagram\.com\/p\//) || url.match(/instagram\.com\/reel\//)), [url]);
  
  // Get card from context
  const card = useMemo(() => state.cards.find(c => c.id === itemId), [state.cards, itemId]);
  if (!card) return null;

  // Use new drag system
  const { handleMouseDown, elementRef } = useDrag({
    onDragStart: useCallback(() => {
      setIsDragging(true);
      dispatch({ type: "SELECT_CARD", payload: card.id });
    }, [card.id, dispatch]),
    onDragEnd: useCallback((newPosition) => {
      setIsDragging(false);
      dispatch({
        type: "UPDATE_CARD",
        payload: { id: card.id, updates: { position: newPosition } }
      });
      // Update storage
      if (storage) {
        storage.updateItem(card.id, { position: newPosition });
      }
    }, [card.id, dispatch, storage]),
    disabled: false
  });

  // Selection handling
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    dispatch({ type: "SELECT_CARD", payload: card.id });
  }, [card.id, dispatch]);

  // Memoize metadata fetching to prevent unnecessary requests
  const getMetadata = useCallback(async () => {
    if (initialMetadata || !url || isLoading) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [url, itemId, initialMetadata, storage, isLoading]);

  // Memoize tweet fetching
  const fetchTweetEmbed = useCallback(async () => {
    if (!isTwitterUrl || tweetHtml || isLoading) return;
    
    setIsLoading(true);
    try {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&theme=light&dnt=true`;
      
      const response = await fetch(oembedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.html) {
        setTweetHtml(data.html);
        setError(null);
      } else {
        throw new Error('No HTML content in response');
      }
    } catch (error) {
      console.error('Error fetching tweet embed:', error);
      setError(error.message);
      setTweetHtml(`<a href="${url}" target="_blank" rel="noopener noreferrer">View tweet on Twitter</a>`);
    } finally {
      setIsLoading(false);
    }
  }, [isTwitterUrl, url, tweetHtml, isLoading]);

  // Only fetch metadata once when component mounts or URL changes
  useEffect(() => {
    if (!initialMetadata && url && !isLoading) {
      getMetadata();
    }
  }, [getMetadata, initialMetadata, url, isLoading]);

  // Only fetch tweet embed once when component mounts or URL changes
  useEffect(() => {
    if (isTwitterUrl && !tweetHtml && !isLoading) {
      fetchTweetEmbed();
    }
  }, [fetchTweetEmbed, isTwitterUrl, tweetHtml, isLoading]);

  // Memoize the card style to prevent re-renders
  const cardStyle = useMemo(() => ({
    position: 'absolute',
    left: `${card.position.x}px`,
    top: `${card.position.y}px`,
    cursor: 'move',
    transform: 'translateZ(0)' // Force GPU acceleration
  }), [card.position.x, card.position.y]);

  // If it's a Twitter URL, render the tweet embed
  if (isTwitterUrl) {
    return (
      <div
        ref={elementRef}
        className={`link-card tweet-card ${card.selected ? 'selected' : ''}`}
        style={cardStyle}
        onMouseDown={(e) => handleMouseDown(e, card.position)}
        onClick={handleClick}
      >
        {!tweetHtml && isLoading ? (
          <div className="tweet-loading">Loading tweet...</div>
        ) : error ? (
          <div className="tweet-error">
            <p>Unable to load tweet: {error}</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="tweet-fallback-link">
              View tweet on Twitter
            </a>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: tweetHtml }} />
        )}
      </div>
    );
  }

  // If it's an Instagram post URL, render the Instagram embed
  if (isInstagramUrl) {
    const instagramId = url.split('/p/')[1]?.split('/')[0];
    
    return (
      <div
        ref={elementRef}
        className={`link-card instagram-card ${card.selected ? 'selected' : ''}`}
        style={cardStyle}
        onMouseDown={(e) => handleMouseDown(e, card.position)}
        onClick={handleClick}
      >
        {isDragging ? (
          // Show placeholder during drag to improve performance
          <div style={{ 
            width: '100%', 
            height: '400px', 
            background: '#f0f0f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '12px',
            border: '2px dashed #ccc'
          }}>
            <span style={{ color: '#666' }}>Instagram Post</span>
          </div>
        ) : (
          <iframe
            src={`https://www.instagram.com/p/${instagramId}/embed`}
            width="100%"
            height="400"
            scrolling="no"
            allowTransparency={true}
            allow="encrypted-media"
            title="Instagram Post Preview"
            style={{ border: 'none', borderRadius: '12px', background: 'white', padding: '6px'}}
            loading="lazy"
          />
        )}
      </div>
    );
  }

  // Regular link card for non-Twitter URLs
  return (
    <div
      ref={elementRef}
      className={`link-card ${card.selected ? 'selected' : ''}`}
      style={cardStyle}
      onMouseDown={(e) => handleMouseDown(e, card.position)}
      onClick={handleClick}
    >
      <div className="link-preview">
        {metadata.imageUrl && (
          <div className="link-image-container">
            <img 
              src={metadata.imageUrl} 
              alt="" 
              className="link-preview-image" 
              loading="lazy"
            />
          </div>
        )}
        <div className="link-content">
          <div className="link-header">
            <span className="link-domain">{domain}</span>
          </div>
          <a href={url || '#'} target="_blank" rel="noopener noreferrer" className="link-title">
            {metadata.title || url || 'No URL'} <span className="external-link-icon">↗</span>
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