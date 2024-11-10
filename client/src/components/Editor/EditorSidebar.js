import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Divider 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { stripePromise } from '../../utils/stripe';
import { useSubscription } from '../../hooks/useSubscription';
import StarIcon from '@mui/icons-material/Star';
import IdeaBox from './sidebar/IdeaBox';
import TemplateBox from './sidebar/TemplateBox';
import ActionBox from './sidebar/ActionBox';
import FormattingBox from './sidebar/FormattingBox';

export default function EditorSidebar() {
  const { user, userRole } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(false);
  const isBasisUser = userRole === 'basis';

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const stripe = await stripePromise;
      
      console.log('Starting checkout...'); // Debug log

      // Server-seitige Checkout Session erstellen
      const response = await fetch('http://localhost:5000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const { sessionId } = await response.json();
      console.log('Got session ID:', sessionId); // Debug log

      // Redirect zu Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 360 }}>
      {/* Formatierungsbox wird immer angezeigt */}
      <FormattingBox />
      
      <Divider sx={{ my: 2 }} />

      {/* Premium Features */}
      {!isBasisUser && (
        <>
          <IdeaBox />
          <Divider sx={{ my: 2 }} />
          <TemplateBox />
          <Divider sx={{ my: 2 }} />
          <ActionBox />
        </>
      )}
      
      {/* Upgrade Box für Basis-User */}
      {isBasisUser && (
        <Paper 
          elevation={3}
          sx={{ 
            p: 2, 
            mt: 2,
            border: '1px solid',
            borderColor: 'primary.main',
            backgroundColor: 'primary.light',
            color: 'primary.contrastText'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            gap: 1
          }}>
            <StarIcon />
            <Typography variant="h6" component="h3">
              Upgrade auf Premium
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Schalte alle Premium-Features frei:
          </Typography>
          
          <Box sx={{ 
            mb: 3,
            pl: 1
          }}>
            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
              ✓ KI-Unterstützung
            </Typography>
            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
              ✓ Template-Verwaltung
            </Typography>
            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
              ✓ PDF-Integration
            </Typography>
            <Typography variant="body2" component="div">
              ✓ Perplexity.ai Integration
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleUpgrade}
            disabled={loading || subscriptionLoading}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
              }
            }}
          >
            {loading || subscriptionLoading ? (
              <CircularProgress size={24} color="primary" />
            ) : (
              subscription?.status === 'canceled' ? 'Premium reaktivieren' : 'Jetzt upgraden'
            )}
          </Button>
          
          {subscription?.status === 'canceled' && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 2, 
                display: 'block', 
                textAlign: 'center',
                color: 'primary.contrastText' 
              }}
            >
              Dein Premium-Zugang läuft am {
                new Date(subscription.cancel_at).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              } aus
            </Typography>
          )}
        </Paper>
      )}

      {/* Zusätzliche Informationen für Premium User */}
      {!isBasisUser && subscription && (
        <Box sx={{ mt: 2, p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Premium Mitglied seit: {
              new Date(subscription.created).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            }
          </Typography>
          {subscription.status === 'canceled' && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Abo endet am: {
                new Date(subscription.cancel_at).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              }
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
} 