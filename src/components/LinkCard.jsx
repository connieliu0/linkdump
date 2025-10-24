// src/components/LinkCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchMetadata, getBaseDomain } from '../utils/urlMetadata';
import { normalizeUrl, getDisplayUrl } from '../utils/linkProcessing';

const LinkCard = React.memo(function LinkCard({ url, itemId, initialMetadata, storage }) {
  const [metadata, setMetadata] = useState(initialMetadata || {});
  const [tweetHtml, setTweetHtml] = useState('');
  const [error, setError] = useState(null);
  
  // Normalize URL for linking but keep original for display
  const normalizedUrl = normalizeUrl(url);
  const displayUrl = getDisplayUrl(normalizedUrl);
  const domain = getBaseDomain(normalizedUrl);
  const tweetRef = useRef(null);

  useEffect(() => {
    if (initialMetadata) return;

    const getMetadata = async () => {
      setMetadata(prev => ({ ...prev, isLoading: true }));
      try {
        const data = await fetchMetadata(normalizedUrl);
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
          title: displayUrl ?? '',
          isLoading: false
        });
      }
    };

    getMetadata();
  }, [normalizedUrl, itemId, initialMetadata, storage, displayUrl]);

  useEffect(() => {
    const fetchTweetEmbed = async () => {
      if (!normalizedUrl.includes('twitter.com') && !normalizedUrl.includes('x.com')) return;
      
      try {
        // Convert Twitter URL to oEmbed URL
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalizedUrl)}&theme=light&dnt=true`;
        console.log('Fetching tweet from:', oembedUrl);
        
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
        console.log('Tweet data received:', data);
        
        if (data.html) {
          setTweetHtml(data.html);
          setError(null);
        } else {
          throw new Error('No HTML content in response');
        }
      } catch (error) {
        console.error('Error fetching tweet embed:', error);
        setError(error.message);
        setTweetHtml(`<a href="${normalizedUrl}" target="_blank" rel="noopener noreferrer">View tweet on Twitter</a>`);
      }
    };

    fetchTweetEmbed();
  }, [normalizedUrl]);

  // If it's a Twitter URL, render the tweet embed
  if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) {
    return (
      <div className="link-card tweet-card" ref={tweetRef}>
        {!tweetHtml ? (
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
  if (normalizedUrl.match(/instagram\.com\/p\//) || normalizedUrl.match(/instagram\.com\/reel\//)) {
    return (
      <div className="link-card instagram-card">
        <iframe
          src={`https://www.instagram.com/p/${normalizedUrl.split('/p/')[1]?.split('/')[0]}/embed`}
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
          <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" className="link-title">
            {metadata.title || displayUrl} <span className="external-link-icon">↗</span>
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