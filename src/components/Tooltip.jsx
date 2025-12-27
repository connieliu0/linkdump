import React, { useState, cloneElement } from 'react';

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Clone the child element and add tooltip + hover handlers
  return cloneElement(children, {
    onMouseEnter: (e) => {
      setIsVisible(true);
      // Call original handler if it exists
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e) => {
      setIsVisible(false);
      // Call original handler if it exists
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    children: (
      <>
        {children.props.children}
        {isVisible && (
          <div className="tooltip">
            {text}
          </div>
        )}
      </>
    )
  });
};

export default Tooltip;
