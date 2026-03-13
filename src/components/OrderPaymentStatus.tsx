import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { checkOrderPaymentStatus, type CheckOrderPaymentResponse } from '../services/stripe';
import CheckoutModal from './CheckoutModal';

interface OrderPaymentStatusProps {
  orderId: string;
  orderAmount: number; // Amount in cents
  currency: string;
  description?: string;
  onPaymentComplete?: () => void;
}

export const OrderPaymentStatus: React.FC<OrderPaymentStatusProps> = ({
  orderId,
  orderAmount,
  currency,
  description,
  onPaymentComplete,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<CheckOrderPaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check payment status
  const fetchPaymentStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await checkOrderPaymentStatus({ order_id: orderId });
      setPaymentStatus(response);
      
      // If payment is completed, trigger callback
      if (response.is_paid && onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check payment status');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, onPaymentComplete]);

  useEffect(() => {
    if (orderId) {
      fetchPaymentStatus();
    }
  }, [orderId, fetchPaymentStatus]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
        <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
        <span className="text-gray-600">Checking payment status...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">Error: {error}</p>
        <button
          onClick={fetchPaymentStatus}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render payment status
  const renderPaymentStatus = () => {
    if (!paymentStatus) return null;

    switch (paymentStatus.payment_status) {
      case 'PAID':
        return (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 text-lg">Payment Completed ✓</h3>
                <p className="text-green-700 text-sm mt-1">
                  This order has been successfully paid
                </p>
                {paymentStatus.payment_completed_at && (
                  <p className="text-green-600 text-xs mt-2">
                    Paid on: {new Date(paymentStatus.payment_completed_at).toLocaleString()}
                  </p>
                )}
                <div className="mt-3 p-3 bg-green-100 rounded border border-green-300">
                  <p className="text-sm text-green-800">
                    <strong>For Picker/Buyer:</strong> Payment is confirmed. You can proceed with delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'PENDING':
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 text-lg">Payment Pending</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  This order requires payment before delivery can proceed
                </p>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="mt-3 w-full bg-[#FFDF57] hover:bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        );

      case 'FAILED':
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 text-lg">Payment Failed</h3>
                <p className="text-red-700 text-sm mt-1">
                  The previous payment attempt failed. Please try again.
                </p>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="mt-3 w-full bg-[#FFDF57] hover:bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Retry Payment
                </button>
              </div>
            </div>
          </div>
        );

      case 'REFUNDED':
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 text-lg">Payment Refunded</h3>
                <p className="text-blue-700 text-sm mt-1">
                  This payment has been refunded
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchPaymentStatus(); // Refresh payment status
    if (onPaymentComplete) {
      onPaymentComplete();
    }
  };

  return (
    <>
      {renderPaymentStatus()}

      {/* Payment Modal */}
      {showPaymentModal && !paymentStatus?.is_paid && (
        <CheckoutModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          paymentData={{
            amount: orderAmount,
            currency: currency,
            description: description || `Payment for order ${orderId}`,
            order_id: orderId,
            metadata: {
              order_id: orderId,
            },
          }}
        />
      )}
    </>
  );
};

export default OrderPaymentStatus;
