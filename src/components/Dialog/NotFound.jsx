import React from 'react';
import Modal from './Modal';
const NotFound = ({ onCreateNewBoard }) => {
  return (
    <Modal isOpen={true} title="Board Not Found" description="This board either doesn't exist or has expired. Would you like to create a new one?"
     primaryButton={{
      label: "Create New Board",
      onClick: onCreateNewBoard
    }}
     onClose={() => {}}>
    </Modal>
  );
};

export default NotFound;