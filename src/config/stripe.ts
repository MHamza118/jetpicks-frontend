import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error('Stripe public key not found in environment variables');
}

export const stripePromise = loadStripe(stripePublicKey);

export const STRIPE_CONFIG = {
  publicKey: stripePublicKey,
  // Add your app name and logo for Payment Element
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#3b82f6',
      fontFamily: 'system-ui',
      fontSizeBase: '16px',
    },
  },
};

export default stripePromise;
