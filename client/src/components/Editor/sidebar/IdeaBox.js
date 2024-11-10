import React, { useState, useRef } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEditorContext } from '../EditorContext';

export default function IdeaBox() {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState('professional');
  const [postLength, setPostLength] = useState('medium');
  const [perplexityContent, setPerplexityContent] = useState('');
  const [wikiContent, setWikiContent] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const { 
    setContent,
    setIsProcessing
  } = useEditorContext();

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch('http://localhost:5001/api/upload-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSelectedPdf(file);
      setSnackbarMessage('PDF erfolgreich verarbeitet');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setError('PDF Upload fehlgeschlagen: ' + error.message);
      setSelectedPdf(null);
      setSnackbarMessage('PDF Upload fehlgeschlagen');
      setOpenSnackbar(true);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSelectedImage(file);
      setSnackbarMessage('Bild ausgewählt');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error handling image:', error);
      setSelectedImage(null);
      setSnackbarMessage('Fehler beim Auswählen des Bildes');
      setOpenSnackbar(true);
    }
  };

  const generatePost = async () => {
    if (!idea.trim()) return;

    try {
      setIsGenerating(true);
      setIsProcessing(true);
      setError('');

      let imageDesc = '';
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const imageResponse = await fetch('http://localhost:5001/api/analyze-image', {
          method: 'POST',
          body: formData
        });

        if (!imageResponse.ok) {
          throw new Error('Image analysis failed');
        }

        const imageData = await imageResponse.json();
        imageDesc = imageData.description;
      }

      const response = await fetch('http://localhost:5001/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: idea,
          type: 'GeneratePost',
          additionalContent: {
            tone,
            length: postLength,
            imageDescription: imageDesc,
            pdfText: selectedPdf ? 'PDF content here' : '',
            perplexityContent: perplexityContent || '',
            wikiContent: wikiContent || ''
          }
        })
      });

      if (!response.ok) throw new Error('Transform request failed');
      
      const data = await response.json();
      setContent(data.transformedText);
      
      // Reset form
      setIdea('');
      setTone('professional');
      setPostLength('medium');
      setPerplexityContent('');
      setWikiContent('');
      setSelectedPdf(null);
      setSelectedImage(null);

    } catch (error) {
      console.error('Error generating post:', error);
      setError('Fehler bei der Post-Generierung: ' + error.message);
    } finally {
      setIsGenerating(false);
      setIsProcessing(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Ideen & Quellen
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Deine Idee"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          size="small"
        />

        <FormControl fullWidth size="small">
          <InputLabel>Tonalität</InputLabel>
          <Select
            value={tone}
            label="Tonalität"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="professional">Professionell</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="enthusiastic">Enthusiastisch</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Länge</InputLabel>
          <Select
            value={postLength}
            label="Länge"
            onChange={(e) => setPostLength(e.target.value)}
          >
            <MenuItem value="short">Kurz</MenuItem>
            <MenuItem value="medium">Mittel</MenuItem>
            <MenuItem value="long">Lang</MenuItem>
          </Select>
        </FormControl>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Zusätzliche Quellen</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  ref={pdfInputRef}
                  onChange={handlePdfUpload}
                />
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => pdfInputRef.current.click()}
                >
                  PDF Upload
                </Button>
                {selectedPdf && (
                  <Typography variant="body2" color="textSecondary">
                    {selectedPdf.name}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<ImageIcon />}
                  onClick={() => imageInputRef.current.click()}
                >
                  Bild Upload
                </Button>
                {selectedImage && (
                  <Typography variant="body2" color="textSecondary">
                    {selectedImage.name}
                  </Typography>
                )}
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Perplexity Link"
                value={perplexityContent}
                onChange={(e) => setPerplexityContent(e.target.value)}
                placeholder="Füge den Perplexity Link ein"
              />

              <TextField
                fullWidth
                size="small"
                label="Wikipedia Link"
                value={wikiContent}
                onChange={(e) => setWikiContent(e.target.value)}
                placeholder="Füge den Wikipedia Link ein"
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        <Button
          variant="contained"
          onClick={generatePost}
          disabled={!idea.trim() || isGenerating}
          fullWidth
          startIcon={isGenerating ? <CircularProgress size={20} /> : null}
        >
          {isGenerating ? 'Generiere...' : 'Generieren'}
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setOpenSnackbar(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Paper>
  );
} 