import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader } from 'lucide-react';
import { confirmPayment } from '../services/stripe';

interface PaymentFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onProcessing?: (processing: boolean) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSuccess,
  onError,
  onProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isElementReady, setIsElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe not loaded');
      return;
    }

    setIsProcessing(true);
    onProcessing?.(true);
    setErrorMessage(null);

    try {
      // Step 1: Submit the form to validate all fields
      const submitResult = await elements.submit();
      
      if (submitResult.error) {
        setErrorMessage(submitResult.error.message || 'Payment validation failed');
        onError?.(submitResult.error.message || 'Payment validation failed');
        return;
      }

      // Step 2: Confirm the payment with Stripe (no redirect)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError?.(error.message || 'Payment failed');
      } else if (paymentIntent) {
        // Payment succeeded - update our backend immediately
        try {
          await confirmPayment({ paymentIntentId: paymentIntent.id });
        } catch (confirmError) {
          console.error('Failed to confirm payment with backend:', confirmError);
          // Don't fail the payment, just log the error
        }
        
        // Trigger success callback
        onSuccess?.();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment error';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
      onProcessing?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Loading Skeleton */}
      {!isElementReady && (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      )}
      
      {/* Payment Element */}
      <div className={!isElementReady ? 'hidden' : ''}>
        <PaymentElement
          onReady={() => setIsElementReady(true)}
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">⚠️ {errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements || !isElementReady}
        className="w-full bg-[#FFDF57] hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        {isProcessing && <Loader className="w-5 h-5 animate-spin" />}
        {isProcessing ? 'Processing Payment...' : 'Pay Now'}
      </button>

      <p className="text-xs text-gray-500 text-center mt-2">
        🔒 Secure payment powered by Stripe
      </p>
    </form>
  );
};

export default PaymentForm;
