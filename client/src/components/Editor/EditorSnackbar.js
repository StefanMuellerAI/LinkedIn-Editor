import React from 'react';
import { Snackbar } from '@mui/material';
import { useEditorContext } from './EditorContext';

export default function EditorSnackbar() {
  const { 
    openSnackbar, 
    handleCloseSnackbar, 
    snackbarMessage 
  } = useEditorContext();

  return (
    <Snackbar
      open={openSnackbar}
      autoHideDuration={2000}
      onClose={handleCloseSnackbar}
      message={snackbarMessage}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    />
  );
} 