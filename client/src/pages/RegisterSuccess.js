import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function RegisterSuccess() {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <CheckCircleOutlineIcon 
            sx={{ 
              fontSize: 60, 
              color: 'success.main',
              mb: 2 
            }} 
          />
          
          <Typography component="h1" variant="h4" gutterBottom>
            Registrierung erfolgreich!
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }}>
            Vielen Dank für deine Registrierung. Wir haben dir eine Bestätigungs-Email geschickt. 
            Bitte klicke auf den Link in der Email, um deine E-Mail-Adresse zu bestätigen. 
            Erst danach kannst du dich einloggen.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Zum Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
} 