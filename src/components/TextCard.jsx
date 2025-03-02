import React, { useState, useRef, useEffect } from 'react';
import { db } from '../utils/storage';

const TextCard = ({ content, itemId, sourceUrl: initialSourceUrl, isEmpty, showSourceUrl = false, onInputActiveChange, type }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isContentEditing, setIsContentEditing] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl || '');
  const [cardContent, setCardContent] = useState(content || '');
  const contentRef = useRef(null);

  // Add ref for text length
  const textLength = useRef(null);

  // Determine if any input is active
  const isInputActive = isContentEditing || isEditing;

  useEffect(() => {
    if (isEmpty && contentRef.current) {
      setIsContentEditing(true);
    }
  }, [isEmpty]);

  useEffect(() => {
    onInputActiveChange(isContentEditing || isEditing);
  }, [isContentEditing, isEditing, onInputActiveChange]);

  useEffect(() => {
    // Move caret to end when editing starts
    if ((isContentEditing || isEditing) && contentRef.current) {
      contentRef.current.selectionStart = contentRef.current.value.length;
      contentRef.current.selectionEnd = contentRef.current.value.length;
    }
  }, [isContentEditing, isEditing]);

  // Add function to adjust height
  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const handleContentClick = (e) => {
    // Only allow editing for newText type
    if (type === 'newText') {
      e.stopPropagation();
      setIsContentEditing(true);
    }
  };

  const handleContentChange = async (e) => {
    const newContent = e.target.value;
    setCardContent(newContent);
    adjustTextareaHeight(e.target);
    await db.items.update(itemId, { 
      content: newContent,
      isEmpty: newContent.trim() === ''
    });
  };

  const handleContentKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      setIsContentEditing(false);
    }
  };

  const handleContentPaste = (e) => {
    e.stopPropagation();
  };

  const handleSourceClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSourceChange = async (e) => {
    const newSource = e.target.value;
    setSourceUrl(newSource);
    await db.items.update(itemId, { sourceUrl: newSource });
  };

  const handleSourceKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  const handleSourcePaste = (e) => {
    e.stopPropagation();
  };

  const handleFocus = (e) => {
    e.stopPropagation();
    onInputActiveChange(true);
  };

  const handleBlur = (e) => {
    onInputActiveChange(false);
    if (e.target.classList.contains('content-input')) {
      setIsContentEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div className={`text-container ${isInputActive ? 'input-active' : ''}`}>
      <div className="text-content">
        {isContentEditing && type === 'newText' ? (
          <textarea
            ref={contentRef}
            value={cardContent}
            onChange={handleContentChange}
            onKeyDown={handleContentKeyDown}
            onFocus={(e) => {
              handleFocus(e);
              adjustTextareaHeight(e.target);
            }}
            onBlur={handleBlur}
            className={`input-field content-input ${type === 'newText' ? 'new-text' : ''}`}
            placeholder={isEmpty ? "Click to edit" : ""}
            style={{ height: textLength.current ? `${textLength.current}px` : 'auto' }}
            autoFocus
          />
        ) : (
          <div 
            className={`${isEmpty ? 'empty-content' : ''} ${type === 'newText' ? 'editable' : ''}`}
            onClick={handleContentClick}
            ref={el => {
              if (el) textLength.current = el.clientHeight;
            }}
          >
            {cardContent || (type === 'newText' ? 'Click to edit' : '')}
          </div>
        )}
      </div>
      
      {showSourceUrl && !isEmpty && (
        <div 
          className="source-url-container"
          onClick={handleSourceClick}
        >
          {isEditing ? (
            <input
              type="text"
              value={sourceUrl}
              onChange={handleSourceChange}
              onKeyDown={handleSourceKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="input-field source-input"
              placeholder="Add source URL"
              autoFocus
            />
          ) : (
            <div className="source-text">
              {sourceUrl ? sourceUrl : 'Click to add source'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextCard; 