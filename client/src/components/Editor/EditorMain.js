import React from 'react';
import { Paper, Box, Typography, CircularProgress } from '@mui/material';
import { useEditorContext } from './EditorContext';
import EditorContextMenu from './EditorContextMenu';

export default function EditorMain() {
  const { 
    content, 
    handleContentChange,
    isProcessing,
    getWordCount,
    getCharCount,
    getCurrentLineLength,
    MAX_LINE_LENGTH,
    handleContextMenu,
    setEditorRef
  } = useEditorContext();

  const wordCount = content ? getWordCount() : 0;
  const charCount = content ? getCharCount() : 0;
  const lineLength = getCurrentLineLength();

  return (
    <>
      <Paper sx={{ p: 2, position: 'relative' }}>
        {isProcessing && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <textarea
          id="content-textarea"
          value={content || ''}
          onChange={handleContentChange}
          onContextMenu={handleContextMenu}
          ref={setEditorRef}
          style={{
            width: '100%',
            height: '500px',
            padding: '10px',
            border: 'none',
            resize: 'none',
            fontFamily: 'monospace',
            fontSize: '16px'
          }}
        />

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Typography variant="body2">
            Words: {wordCount}
          </Typography>
          <Typography variant="body2">
            Characters: {charCount}
          </Typography>
          <Typography variant="body2">
            Current Line: {lineLength} / {MAX_LINE_LENGTH}
          </Typography>
        </Box>
      </Paper>
      <Box sx={{ height: '100px' }} />
    </>
  );
} 