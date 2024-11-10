import React from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';
import { useEditorContext } from '../EditorContext';

export default function ActionBox() {
  const { 
    content,
    activePostId,
    handleNewPost,
    saveCurrentPost,
    handleCopy 
  } = useEditorContext();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Aktionen
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          onClick={saveCurrentPost}
          disabled={!content}
          fullWidth
          size="small"
        >
          {activePostId ? 'Aktualisieren' : 'Speichern'}
        </Button>

        <Button
          variant="outlined"
          onClick={handleNewPost}
          fullWidth
          size="small"
        >
          Neuer Post
        </Button>

        <Button
          variant="outlined"
          onClick={handleCopy}
          disabled={!content}
          fullWidth
          size="small"
        >
          Copy
        </Button>
      </Box>
    </Paper>
  );
} 