import { useSubscription } from '../hooks/useSubscription';
import { payments } from '../utils/stripe';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Box, Button } from '@mui/material';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Account() {
  const { subscription, loading } = useSubscription();
  const { user } = useAuth();

  const handleManageSubscription = async () => {
    try {
      const portalUrl = await payments.portal({
        returnUrl: window.location.origin + '/account',
      });
      window.location.assign(portalUrl);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Typography variant="h4">Account</Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Subscription Status</Typography>
        <Typography>
          {subscription ? 'Premium' : 'Basic'} Plan
        </Typography>
        {subscription && (
          <Button 
            onClick={handleManageSubscription}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Manage Subscription
          </Button>
        )}
      </Box>
    </Container>
  );
} 