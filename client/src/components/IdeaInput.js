import React, { useState, useRef } from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Snackbar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';

export default function IdeaInput({ setContent, setIsProcessing, processLineBreaks }) {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState('professional');
  const [postLength, setPostLength] = useState('medium');
  const [imageDescription, setImageDescription] = useState('');
  const [pdfContent, setPdfContent] = useState('');
  const [perplexityContent, setPerplexityContent] = useState('');
  const [wikiContent, setWikiContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [isScrapingPerplexity, setIsScrapingPerplexity] = useState(false);
  const [isScrapingWiki, setIsScrapingWiki] = useState(false);

  const resetForm = () => {
    setIdea('');
    setTone('professional');
    setPostLength('medium');
    setImageDescription('');
    setPdfContent('');
    setPerplexityContent('');
    setWikiContent('');
    setSelectedPdf(null);
    setSelectedImage(null);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      console.log('Uploading PDF:', file.name);
      
      const response = await fetch('http://localhost:5001/api/upload-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PDF processed:', data);

      setSelectedPdf(file);
      setPdfContent(data.content);
      setSnackbarMessage('PDF erfolgreich verarbeitet');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setError('PDF Upload fehlgeschlagen: ' + error.message);
      setSelectedPdf(null);
      setPdfContent('');
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

  const handlePerplexityChange = async (e) => {
    const url = e.target.value;
    setPerplexityContent(url);
    
    if (url && url.includes('perplexity.ai')) {
      try {
        setIsScrapingPerplexity(true);
        const response = await fetch('http://localhost:5001/api/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            type: 'perplexity'
          })
        });

        if (!response.ok) throw new Error('Scraping failed');
        
        const data = await response.json();
        console.log('Scraped Perplexity content:', data);
        setPerplexityContent(data.content);
      } catch (error) {
        console.error('Error scraping Perplexity:', error);
        setError('Fehler beim Laden des Perplexity Inhalts');
      } finally {
        setIsScrapingPerplexity(false);
      }
    }
  };

  const handleWikiChange = async (e) => {
    const url = e.target.value;
    setWikiContent(url);
    
    if (url && url.includes('wikipedia.org')) {
      try {
        setIsScrapingWiki(true);
        const response = await fetch('http://localhost:5001/api/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            type: 'wikipedia'
          })
        });

        if (!response.ok) throw new Error('Scraping failed');
        
        const data = await response.json();
        console.log('Scraped Wiki content:', data);
        setWikiContent(data.content);
      } catch (error) {
        console.error('Error scraping Wikipedia:', error);
        setError('Fehler beim Laden des Wikipedia Inhalts');
      } finally {
        setIsScrapingWiki(false);
      }
    }
  };

  const generatePost = async () => {
    try {
      setIsGenerating(true);
      setIsProcessing(true);
      setError('');

      let imageDesc = '';
      
      if (selectedImage) {
        try {
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
        } catch (error) {
          console.error('Error analyzing image:', error);
          setError('Fehler bei der Bildanalyse: ' + error.message);
          return;
        }
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
            pdfText: pdfContent || '',
            perplexityContent: perplexityContent || '',
            wikiContent: wikiContent || ''
          }
        })
      });

      if (!response.ok) throw new Error('Transform request failed');
      
      const data = await response.json();
      
      if (processLineBreaks) {
        processLineBreaks(data.transformedText);
      } else {
        setContent(data.transformedText);
      }

      resetForm();
    } catch (error) {
      console.error('Error generating post:', error);
      setError('Fehler bei der Post-Generierung: ' + error.message);
    } finally {
      setIsGenerating(false);
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Deine Idee"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
      />

      <FormControl fullWidth>
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

      <FormControl fullWidth>
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
                startIcon={<AttachFileIcon />}
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
              label="Perplexity Link"
              value={perplexityContent}
              onChange={(e) => setPerplexityContent(e.target.value)}
              placeholder="Füge den Perplexity Link ein"
            />

            <TextField
              fullWidth
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
        disabled={!idea || isGenerating}
        startIcon={isGenerating ? <CircularProgress size={20} /> : null}
      >
        {isGenerating ? 'Generiere...' : 'Generieren'}
      </Button>

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
    </Box>
  );
}
