import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { X, AlertCircle, Loader } from "lucide-react";
import PaymentForm from "./PaymentForm";
import stripePromise from "../config/stripe";
import { createPaymentIntent, formatAmountFromCents } from "../services/stripe";
import { formatPriceWithCurrency } from "../services/currencies";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  paymentData: {
    amount: number; // Amount in cents
    currency: string;
    description?: string;
    customerEmail?: string;
    metadata?: Record<string, string | number>;
    order_id?: string; // Optional order ID
  };
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  paymentData,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const initializePayment = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const response = await createPaymentIntent({
          amount: paymentData.amount,
          currency: paymentData.currency,
          description: paymentData.description,
          customer_email: paymentData.customerEmail,
          metadata: paymentData.metadata,
          order_id: paymentData.order_id,
        });

        if (response.success) {
          setClientSecret(response.clientSecret);
        } else {
          // backend may include `error` or `message` text
          const msg =
            (response as any).error ||
            (response as any).message ||
            "Failed to initialize payment";
          setError(msg);
        }
      } catch (err) {
        // axios/ApiError may not be instance of Error, try to extract
        let msg = "Payment initialization failed";
        if (err instanceof Error) {
          msg = err.message;
        } else if (err && typeof err === "object" && "message" in err) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          msg = (err as any).message;
        }
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [isOpen, paymentData, retryCount]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payment Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Summary */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPriceWithCurrency(
                formatAmountFromCents(paymentData.amount),
                paymentData.currency,
              )}
            </p>
            {paymentData.description && (
              <p className="text-xs text-gray-500 mt-2">
                {paymentData.description}
              </p>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium text-sm">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setClientSecret(null);
                    setRetryCount((prev) => prev + 1);
                  }}
                  className="text-red-600 hover:text-red-700 text-xs mt-2 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !clientSecret && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 text-yellow-500 animate-spin mb-4" />
              <p className="text-gray-600 text-sm">Initializing payment...</p>
            </div>
          )}

          {/* Payment Form */}
          {!error && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "flat",
                  variables: {
                    colorPrimary: "#FFDF57",
                    colorBackground: "#ffffff",
                    colorText: "#1f2937",
                    colorDanger: "#dc2626",
                    fontFamily: "system-ui",
                    fontSizeBase: "16px",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <PaymentForm onSuccess={handleSuccess} onError={handleError} />
            </Elements>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Powered by Stripe - Your payment is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
