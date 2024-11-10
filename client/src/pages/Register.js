import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert,
  Link
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Starting registration process...');

    if (password !== passwordConfirm) {
      return setError('Passwörter stimmen nicht überein');
    }

    if (password.length < 6) {
      return setError('Passwort muss mindestens 6 Zeichen lang sein');
    }

    try {
      setError('');
      setLoading(true);
      console.log('Attempting signup with email:', email);
      const result = await signup(email, password);
      console.log('Signup successful:', result);
      navigate('/register-success');
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError(
        error.code === 'auth/email-already-in-use' ? 'Email bereits registriert' :
        error.code === 'auth/invalid-email' ? 'Ungültige Email-Adresse' :
        error.code === 'auth/operation-not-allowed' ? 'Email/Password Login ist nicht aktiviert' :
        error.code === 'auth/weak-password' ? 'Passwort ist zu schwach' :
        `Fehler bei der Registrierung: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Registrierung
        </Typography>
        
        <Paper sx={{ p: 4, width: '100%', mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Passwort bestätigen"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Lädt...' : 'Registrieren'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                Bereits registriert? Zum Login
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
} 