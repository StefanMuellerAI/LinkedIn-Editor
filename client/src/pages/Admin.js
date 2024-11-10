import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Input, Alert, Snackbar, Typography, MenuItem } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useEditorContext } from '../components/Editor/EditorContext';

export default function Admin() {
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState({ 
    name: '', 
    verwendungszweck: '',
    inhalt: '' 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [showImportMessage, setShowImportMessage] = useState(false);
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  const { refreshTemplates } = useEditorContext();
  const [snackMessage, setSnackMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState('success');

  useEffect(() => {
    fetchTemplates();
    fetchPosts();
  }, []);

  const fetchTemplates = async () => {
    const response = await fetch('http://localhost:5001/api/templates', {
      headers: {
        'user-id': user.uid
      }
    });
    const data = await response.json();
    setTemplates(data);
  };

  const fetchPosts = async () => {
    const response = await fetch('http://localhost:5001/api/posts', {
      headers: {
        'user-id': user.uid
      }
    });
    const data = await response.json();
    setPosts(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing 
      ? `http://localhost:5001/api/templates/${currentTemplate._id}`
      : 'http://localhost:5001/api/templates';
    
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'user-id': user.uid
        },
        body: JSON.stringify(currentTemplate)
      });

      if (!response.ok) throw new Error('Failed to save template');
      
      const newTemplate = await response.json();
      
      if (isEditing) {
        setTemplates(templates.map(t => t._id === newTemplate._id ? newTemplate : t));
        setSnackMessage('Template erfolgreich aktualisiert');
      } else {
        setTemplates([...templates, newTemplate]);
        setSnackMessage('Template erfolgreich erstellt');
      }
      
      setSnackSeverity('success');
      setShowSnackbar(true);
      refreshTemplates();
      setCurrentTemplate({ name: '', verwendungszweck: '', inhalt: '' });
      setIsEditing(false);
    } catch (error) {
      setSnackMessage('Fehler beim Speichern des Templates');
      setSnackSeverity('error');
      setShowSnackbar(true);
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/templates/${id}`, { 
        method: 'DELETE',
        headers: {
          'user-id': user.uid
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete template');
      
      await fetchTemplates();
      setSnackMessage('Template erfolgreich gelöscht');
      setSnackSeverity('success');
      setShowSnackbar(true);
    } catch (error) {
      setSnackMessage('Fehler beim Löschen des Templates');
      setSnackSeverity('error');
      setShowSnackbar(true);
    }
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    setIsEditing(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const templates = JSON.parse(fileContent);
      
      // Validiere das Format
      const isValid = templates.every(template => 
        template.name && 
        template.verwendungszweck && 
        template.inhalt
      );

      if (!isValid) {
        throw new Error('Ungültiges Template-Format');
      }

      // Importiere die Templates
      const response = await fetch('http://localhost:5001/api/templates/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templates)
      });

      if (!response.ok) {
        throw new Error('Import fehlgeschlagen');
      }

      const result = await response.json();
      setImportMessage(`${result.count} Templates erfolgreich importiert`);
      setShowImportMessage(true);
      fetchTemplates(); // Aktualisiere die Liste
    } catch (error) {
      setImportMessage(`Fehler beim Import: ${error.message}`);
      setShowImportMessage(true);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/posts/${id}`, { 
        method: 'DELETE' 
      });
      fetchPosts();
      setImportMessage('Post erfolgreich gelöscht');
      setShowImportMessage(true);
    } catch (error) {
      setImportMessage('Fehler beim Löschen des Posts');
      setShowImportMessage(true);
    }
  };

  return (
    <Box>
      <Header />
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="json-upload"
          />
          <label htmlFor="json-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
            >
              JSON importieren
            </Button>
          </label>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            value={currentTemplate.name}
            onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Verwendungszweck"
            value={currentTemplate.verwendungszweck}
            onChange={(e) => setCurrentTemplate({...currentTemplate, verwendungszweck: e.target.value})}
            sx={{ mb: 2 }}
          >
            {['Hook', 'Corpus', 'CTA'].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Inhalt"
            value={currentTemplate.inhalt}
            onChange={(e) => setCurrentTemplate({...currentTemplate, inhalt: e.target.value})}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            {isEditing ? 'Update Template' : 'Template erstellen'}
          </Button>
        </form>

        <Table sx={{ mt: 4 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Verwendungszweck</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template._id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.verwendungszweck}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(template)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(template._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Gespeicherte Posts
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Zuletzt bearbeitet</TableCell>
                <TableCell>Inhalt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell>
                    {new Date(post.last_edited).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {post.content.substring(0, 50)}...
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeletePost(post._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Snackbar
          open={showImportMessage}
          autoHideDuration={6000}
          onClose={() => setShowImportMessage(false)}
        >
          <Alert 
            onClose={() => setShowImportMessage(false)} 
            severity={importMessage.includes('Fehler') ? 'error' : 'success'}
          >
            {importMessage}
          </Alert>
        </Snackbar>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowSnackbar(false)}
        >
          <Alert 
            onClose={() => setShowSnackbar(false)} 
            severity={snackSeverity}
          >
            {snackMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
} 