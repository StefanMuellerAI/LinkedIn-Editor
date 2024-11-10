import { useAuth } from '../contexts/AuthContext';
import { payments } from '../utils/stripe';

export default function UpgradeButton() {
  const { user } = useAuth();

  const handleUpgrade = async () => {
    try {
      const priceId = 'price_XXXXX'; // Deine Stripe Price ID
      
      const session = await payments.checkout({
        price: priceId,
        success_url: window.location.origin + '/payment-success',
        cancel_url: window.location.origin + '/payment-cancelled',
      });

      window.location.assign(session.url);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Button 
      variant="contained" 
      color="primary" 
      onClick={handleUpgrade}
    >
      Upgrade to Premium
    </Button>
  );
} 