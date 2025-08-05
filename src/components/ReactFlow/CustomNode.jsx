import React, { memo, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import TextCard from '../TextCard';
import ImageCard from '../ImageCard';
import LinkCard from '../LinkCard';

const CustomNode = memo(function CustomNode({ data, selected }) {
  const { item, storage, onInputActiveChange, selectedId, isInputActive, isEditing } = data;
  const { setNodes } = useReactFlow();

  console.log('CustomNode render:', { 
    itemId: item?.id, 
    selected, 
    selectedId,
    isSelected: selectedId === item?.id 
  });

  // Handle text content updates
  const updateTextContent = useCallback((itemId, newContent) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === itemId) {
          return {
            ...n,
            data: {
              ...n.data,
              item: {
                ...n.data.item,
                content: newContent
              }
            }
          };
        }
        return n;
      })
    );
  }, [setNodes]);

  // Handle input active state changes
  const handleInputActiveChange = useCallback((active) => {
    if (onInputActiveChange) {
      onInputActiveChange(active);
    }
  }, [onInputActiveChange]);

  // Determine which card component to render based on item type
  const renderCard = () => {
    switch (item.type) {
      case 'text':
      case 'newText':
      case 'pastedText':
        return (
          <TextCard
            content={item.content}
            itemId={item.id}
            sourceUrl={item.sourceUrl}
            isEmpty={item.isEmpty}
            showSourceUrl={item.type === 'pastedText'}
            onInputActiveChange={handleInputActiveChange}
            type={item.type}
            storage={storage}
            isSelected={selected}
            wasDragged={false}
            onContentChange={(newContent) => updateTextContent(item.id, newContent)}
          />
        );
      case 'image':
        return (
          <ImageCard
            src={item.content}
            itemId={item.id}
            sourceUrl={item.sourceUrl}
            storage={storage}
          />
        );
      case 'link':
        return (
          <LinkCard
            url={item.content}
            itemId={item.id}
            initialMetadata={item.metadata}
            storage={storage}
          />
        );
      default:
        console.warn('Unsupported item type:', item.type, item);
        return <div>Unsupported item type: {item.type}</div>;
    }
  };

  return (
    <div 
      className={`paste-item ${selected ? 'selected' : ''}`}
      style={{
        border: selected ? '2px solid red' : 'none',
        outline: selected ? '2px solid blue' : 'none'
      }}
    >
      {renderCard()}
    </div>
  );
});

export default CustomNode;