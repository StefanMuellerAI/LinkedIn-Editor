import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, userRole } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'basis':
        return '🥉 Basis';
      case 'premium':
        return '🥈 Premium';
      case 'admin':
        return '🥇 Admin';
      default:
        return role;
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          LinkedIn Editor
        </Typography>
        
        {user && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {userRole !== 'basis' && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/editor')}
                variant={isActive('/editor') ? 'outlined' : 'text'}
              >
                Editor
              </Button>
            )}
            
            {userRole !== 'basis' && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/templates')}
                variant={isActive('/templates') ? 'outlined' : 'text'}
              >
                Templates
              </Button>
            )}
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '4px 8px', 
              borderRadius: 1,
              alignItems: 'center'
            }}>
              <Typography variant="body2">
                {user.email}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  borderLeft: '1px solid rgba(255,255,255,0.3)', 
                  paddingLeft: 1 
                }}
              >
                {getRoleDisplay(userRole)}
              </Typography>
            </Box>
            
            <Button 
              color="inherit" 
              onClick={handleLogout}
              variant="outlined"
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
} 