import { useState, useCallback } from "react";
import { createPaymentIntent, formatAmountToCents } from "../services/stripe";

interface UseCheckoutOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useCheckout = (options: UseCheckoutOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const openCheckout = useCallback(
    async (paymentData: {
      amount: number; // in dollars
      currency: string;
      description?: string;
      customerEmail?: string;
      metadata?: Record<string, string | number>;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await createPaymentIntent({
          amount: formatAmountToCents(paymentData.amount),
          currency: paymentData.currency,
          description: paymentData.description,
          customer_email: paymentData.customerEmail,
          metadata: paymentData.metadata,
        });

        if (response.success) {
          setClientSecret(response.clientSecret);
          setIsOpen(true);
        } else {
          const errorMsg =
            (response as any).error ||
            (response as any).message ||
            "Failed to create payment";
          setError(errorMsg);
          options.onError?.(errorMsg);
        }
      } catch (err) {
        let errorMsg = "Payment initialization failed";
        if (err instanceof Error) {
          errorMsg = err.message;
        } else if (err && typeof err === "object" && "message" in err) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorMsg = (err as any).message;
        }
        setError(errorMsg);
        options.onError?.(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [options],
  );

  const closeCheckout = useCallback(() => {
    setIsOpen(false);
    setClientSecret(null);
    setError(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    options.onSuccess?.();
    closeCheckout();
  }, [options, closeCheckout]);

  return {
    isOpen,
    isLoading,
    error,
    clientSecret,
    openCheckout,
    closeCheckout,
    handlePaymentSuccess,
  };
};

export default useCheckout;
