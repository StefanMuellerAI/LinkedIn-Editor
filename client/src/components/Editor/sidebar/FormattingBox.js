import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  ButtonGroup, 
  Button, 
  Popover,
  Box,
  Divider 
} from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import EmojiPicker from 'emoji-picker-react';
import { useEditorContext } from '../EditorContext';

export default function FormattingBox() {
  const { 
    convertToBold, 
    convertToItalic,
    insertText 
  } = useEditorContext();

  const [anchorElEmoji, setAnchorElEmoji] = useState(null);
  const [anchorElAscii, setAnchorElAscii] = useState(null);

  const handleEmojiButtonClick = (event) => {
    setAnchorElEmoji(event.currentTarget);
  };

  const handleAsciiButtonClick = (event) => {
    setAnchorElAscii(event.currentTarget);
  };

  const handleEmojiSelect = (emojiData, event) => {
    if (emojiData && emojiData.emoji) {
      insertText(emojiData.emoji);
      setAnchorElEmoji(null);
    }
  };

  const handleAsciiClick = (char) => {
    insertText(char);
    setAnchorElAscii(null);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Formatierung
      </Typography>

      {/* Text Formatting Buttons */}
      <ButtonGroup variant="outlined" fullWidth sx={{ mb: 2 }}>
        <Button onClick={convertToBold}>B</Button>
        <Button onClick={convertToItalic}>I</Button>
      </ButtonGroup>

      {/* ASCII und Emoji Buttons */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Sonderzeichen
        </Typography>
        <ButtonGroup variant="outlined" fullWidth>
          <Button
            onClick={handleAsciiButtonClick}
            startIcon={<TextFormatIcon />}
          >
            ASCII
          </Button>
          <Button
            onClick={handleEmojiButtonClick}
            startIcon={<EmojiEmotionsIcon />}
          >
            Emoji
          </Button>
        </ButtonGroup>
      </Box>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(anchorElEmoji)}
        anchorEl={anchorElEmoji}
        onClose={() => setAnchorElEmoji(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 1 }}>
          <EmojiPicker onEmojiClick={handleEmojiSelect} />
        </Box>
      </Popover>

      {/* ASCII Popover */}
      <Popover
        open={Boolean(anchorElAscii)}
        anchorEl={anchorElAscii}
        onClose={() => setAnchorElAscii(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            ASCII Zeichen
          </Typography>
          <ButtonGroup variant="outlined" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {['•', '◦', '▪', '▫', '→', '←', '↑', '↓', '♦', '★', '☆', '✓'].map((char) => (
              <Button key={char} onClick={() => handleAsciiClick(char)} size="small">
                {char}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Popover>
    </Paper>
  );
} 