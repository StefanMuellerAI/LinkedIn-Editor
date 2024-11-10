import React from 'react';
import { 
  Paper, 
  Typography, 
  Select, 
  MenuItem, 
  Box 
} from '@mui/material';
import { useEditorContext } from '../EditorContext';

export default function TemplateBox() {
  const { 
    templates, 
    handleTemplateChange,
    posts,
    handlePostChange
  } = useEditorContext();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Templates & Posts
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Select
          value=""
          onChange={handleTemplateChange}
          displayEmpty
          fullWidth
          size="small"
        >
          <MenuItem value="" disabled>
            Template auswählen
          </MenuItem>
          {templates.map((template) => (
            <MenuItem key={template._id} value={template._id}>
              {template.name} - {template.verwendungszweck}
            </MenuItem>
          ))}
        </Select>

        <Select
          value=""
          onChange={handlePostChange}
          displayEmpty
          fullWidth
          size="small"
        >
          <MenuItem value="" disabled>
            Post laden
          </MenuItem>
          {posts.map((post) => (
            <MenuItem key={post._id} value={post._id}>
              {new Date(post.last_edited).toLocaleString()} - 
              {post.content.substring(0, 30)}...
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Paper>
  );
} 