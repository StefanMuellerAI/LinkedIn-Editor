import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import { 
  Edit as EditIcon,
  AutoStories as PDFIcon,
  Image as ImageIcon,
  Psychology as AIIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Speed as SpeedIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const tiers = [
    {
      title: '🥉 Basis',
      description: 'Perfekt zum Einstieg',
      features: [
        { name: 'Social Media Editor', included: true },
        { name: 'Markdown Unterstützung', included: true },
        { name: 'Echtzeit-Vorschau', included: true },
        { name: 'Formatierungsoptionen', included: true },
        { name: 'KI-Unterstützung', included: false },
        { name: 'Template-Verwaltung', included: false },
        { name: 'PDF-Integration', included: false },
        { name: 'Perplexity.ai Integration', included: false },
        { name: 'Bildanalyse', included: false },
        { name: 'Vorlagen-System', included: false }
      ]
    },
    {
      title: '🥈 Premium',
      description: 'Für professionelle Content Creator',
      features: [
        { name: 'Social Media Editor', included: true },
        { name: 'Markdown Unterstützung', included: true },
        { name: 'Echtzeit-Vorschau', included: true },
        { name: 'Formatierungsoptionen', included: true },
        { name: 'KI-Unterstützung', included: true },
        { name: 'Template-Verwaltung', included: true },
        { name: 'PDF-Integration', included: true },
        { name: 'Perplexity.ai Integration', included: true },
        { name: 'Bildanalyse', included: true },
        { name: 'Vorlagen-System', included: true }
      ]
    }
  ];

  const features = [
    {
      icon: <EditIcon />,
      title: 'Social Media Editor',
      description: 'Erstelle und bearbeite professionelle Social Media Posts mit unserem intuitiven Editor.',
      details: [
        'Markdown Unterstützung',
        'Echtzeit-Vorschau',
        'Automatische Formatierung',
        'Versionierung'
      ]
    },
    {
      icon: <AIIcon />,
      title: 'KI-Unterstützung',
      description: 'Nutze die Kraft der künstlichen Intelligenz für deine Content-Erstellung.',
      details: [
        'Text-Generierung',
        'Inhaltliche Verbesserungen',
        'Tonalitätsanpassung',
        'Mehrsprachige Unterstützung'
      ]
    },
    {
      icon: <SearchIcon />,
      title: 'Recherche-Integration',
      description: 'Integriere Inhalte aus verschiedenen Quellen direkt in deine Posts.',
      details: [
        'Wikipedia Integration',
        'Perplexity.ai Einbindung',
        'Automatische Zusammenfassungen',
        'Quellenangaben'
      ]
    },
    {
      icon: <PDFIcon />,
      title: 'PDF Verarbeitung',
      description: 'Extrahiere und verarbeite Inhalte aus PDF-Dokumenten.',
      details: [
        'PDF Text-Extraktion',
        'Automatische Zusammenfassung',
        'Intelligente Inhaltsanalyse',
        'Formaterhaltung'
      ]
    },
    {
      icon: <ImageIcon />,
      title: 'Bildanalyse',
      description: 'Automatische Bildanalyse und Beschreibungsgenerierung.',
      details: [
        'KI-basierte Bilderkennung',
        'Automatische Bildbeschreibungen',
        'Alt-Text Generierung',
        'Bildoptimierung'
      ]
    },
    {
      icon: <SpeedIcon />,
      title: 'Effizienz',
      description: 'Optimiere deinen Content-Erstellungsprozess.',
      details: [
        'Schnelle Verarbeitung',
        'Batch-Verarbeitung',
        'Vorlagen-System',
        'Automatisierte Workflows'
      ]
    }
  ];

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {/* Hero Section */}
        <Box sx={{ 
          py: 8, 
          background: theme.palette.primary.main,
          color: 'white'
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h2" component="h1" gutterBottom>
                  Social Media Editor
                </Typography>
                <Typography variant="h5" paragraph>
                  Erstelle professionelle Social Media Posts mit KI-Unterstützung
                </Typography>
                <Box sx={{ mt: 4 }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={{ 
                      mr: 2,
                      backgroundColor: 'white',
                      color: theme.palette.primary.main
                    }}
                  >
                    Registrieren
                  </Button>
                  {!user && (
                    <Button
                      variant="contained"
                      onClick={handleLoginClick}
                      size="large"
                      sx={{ 
                        color: 'white',
                        borderColor: 'white'
                      }}
                    >
                      Einloggen
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                {/* Hier könnte ein Screenshot oder eine Illustration sein */}
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Neue Pricing Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Unsere Angebote
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {tiers.map((tier) => (
              <Grid item xs={12} md={6} key={tier.title}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  ...(tier.title.includes('Premium') && {
                    border: `2px solid ${theme.palette.primary.main}`
                  })
                }}>
                  {tier.title.includes('Premium') && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderBottomLeftRadius: 4
                    }}>
                      Empfohlen
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" component="h3" gutterBottom>
                      {tier.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" paragraph>
                      {tier.description}
                    </Typography>
                    <List>
                      {tier.features.map((feature) => (
                        <ListItem key={feature.name}>
                          <ListItemIcon>
                            {feature.included ? (
                              <SaveIcon color="success" />
                            ) : (
                              <CloseIcon color="error" />
                            )}
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature.name}
                            sx={{
                              '& .MuiListItemText-primary': {
                                color: feature.included ? 'text.primary' : 'text.secondary'
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    {!user && (
                      <Button 
                        fullWidth 
                        variant={tier.title.includes('Premium') ? 'contained' : 'outlined'}
                        onClick={() => navigate('/register')}
                        size="large"
                      >
                        {tier.title.includes('Premium') ? 'Premium werden' : 'Kostenlos starten'}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Features
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {React.cloneElement(feature.icon, { 
                        sx: { fontSize: 40, color: theme.palette.primary.main } 
                      })}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {feature.description}
                    </Typography>
                    <List dense>
                      {feature.details.map((detail, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <SaveIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={detail} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Mehr erfahren
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Call to Action */}
        <Box sx={{ 
          py: 8, 
          background: theme.palette.grey[100]
        }}>
          <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>
              Bereit loszulegen?
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              Erstelle noch heute deinen ersten professionellen Social Media Post!
            </Typography>
          </Container>
        </Box>
      </div>
      <Footer />
    </div>
  );
} 