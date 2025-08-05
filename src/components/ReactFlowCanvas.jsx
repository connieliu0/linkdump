import { useCallback, useEffect, useState } from 'react';
import { ReactFlow, Background, Controls, useNodesState, applyNodeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../styles/components.css';
import CustomNode from './ReactFlow/CustomNode';

const ReactFlowCanvas = ({ 
  items, 
  onItemsChange, 
  onSelectionChange, 
  disabled, 
  storage, 
  onInputActiveChange,
  onMouseMove,
  onPaneClick,
  selectedId,
  isDragging,
  isInputActive: externalIsInputActive,
  isEditing: externalIsEditing
}) => {
  const isInputActive = disabled || externalIsInputActive;
  const isEditing = disabled || externalIsEditing;

  // Convert items to nodes format
  const initialNodes = items.map(item => {
    const position = item.position || { x: 100, y: 100 };
    return {
      id: item.id,
      type: 'custom',
      position: { x: position.x || 100, y: position.y || 100 },
      data: { 
        item,
        storage,
        onInputActiveChange,
        disabled,
        selectedId,
        isDragging: false,
        isInputActive,
        isEditing,
        wasDragged: false
      }
    };
  });

  const [nodes, setNodes] = useNodesState(initialNodes);

  // Update nodes when items change
  useEffect(() => {
    const newNodes = items.map(item => {
      const position = item.position || { x: 100, y: 100 };
      return {
        id: item.id,
        type: 'custom',
        position: { x: position.x || 100, y: position.y || 100 },
        data: { 
          item,
          storage,
          onInputActiveChange,
          disabled,
          selectedId,
          isDragging: false,
          isInputActive,
          isEditing,
          wasDragged: false
        }
      };
    });
    setNodes(newNodes);
  }, [items, storage, onInputActiveChange, disabled, selectedId, isInputActive, isEditing, setNodes]);

  // Handle node changes properly
  const onNodesChange = useCallback((changes) => {
    console.log('Node changes:', changes);
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  // Handle selection changes
  const handleSelectionChange = useCallback((selectionData) => {
    console.log('Selection change:', selectionData);
    if (onSelectionChange) {
      onSelectionChange(selectionData);
    }
  }, [onSelectionChange]);

  // Handle node drag end to update positions
  const onNodeDragStop = useCallback((event, node) => {
    console.log('Node drag stop:', node.id, node.position);
    const updatedItems = items.map(item => {
      if (item.id === node.id) {
        return {
          ...item,
          position: {
            x: node.position.x,
            y: node.position.y
          }
        };
      }
      return item;
    });
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  const nodeTypes = {
    custom: CustomNode
  };

  return (
    <div className="canvas-area" style={{ width: '100%', height: '100%' }}>
      <div className="canvas-area__in">
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          onSelectionChange={handleSelectionChange}
          onNodeDragStop={onNodeDragStop}
          onPaneMouseMove={onMouseMove}
          onPaneClick={onPaneClick}
          
          // Node configuration
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          nodesFocusable={true}
          
          // Disable panning entirely for now
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          
          // Viewport settings
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          minZoom={0.5}
          maxZoom={2}
          
          // Styling
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          className="react-flow-canvas"
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ReactFlowCanvas;