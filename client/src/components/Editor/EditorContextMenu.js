import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { useEditorContext } from './EditorContext';

export default function EditorContextMenu() {
  const { 
    contextMenu, 
    handleClose, 
    transformText 
  } = useEditorContext();

  const handleMenuItemClick = (type) => {
    transformText(type);
    handleClose();
  };

  return (
    <Menu
      open={contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={() => handleMenuItemClick('Shorten')}>Kürzen</MenuItem>
      <MenuItem onClick={() => handleMenuItemClick('Extend')}>Erweitern</MenuItem>
      <MenuItem onClick={() => handleMenuItemClick('Rephrase')}>Umformulieren</MenuItem>
    </Menu>
  );
} 