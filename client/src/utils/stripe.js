import { loadStripe } from '@stripe/stripe-js';

if (!process.env.REACT_APP_STRIPE_PUBLIC_KEY) {
  throw new Error('Stripe Public Key ist nicht gesetzt!');
}

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export { stripePromise }; 