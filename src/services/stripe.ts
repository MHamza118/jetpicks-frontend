import { apiClient } from './apiClient';

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents (e.g., 5000 = $50.00)
  currency: string;
  description?: string;
  customer_email?: string;
  metadata?: Record<string, string | number>;
  order_id?: string; // Optional order ID to link payment to order
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  status: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface CheckOrderPaymentRequest {
  order_id: string;
}

export interface CheckOrderPaymentResponse {
  success: boolean;
  order_id: string;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  is_paid: boolean;
  payment_completed_at: string | null;
  stripe_payment_intent_id: string | null;
  order_status: string;
  latest_payment: {
    id: string;
    status: string;
    amount: string;
    currency: string;
    paid_at: string | null;
  } | null;
}

/**
 * Create a payment intent on the backend
 */
export const createPaymentIntent = async (
  data: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> => {
  return apiClient.post<CreatePaymentIntentResponse>('/stripe/create-payment-intent', data);
};

/**
 * Confirm payment status
 */
export const confirmPayment = async (
  data: ConfirmPaymentRequest
): Promise<ConfirmPaymentResponse> => {
  return apiClient.post<ConfirmPaymentResponse>('/stripe/confirm-payment', data);
};

/**
 * Check order payment status
 */
export const checkOrderPaymentStatus = async (
  data: CheckOrderPaymentRequest
): Promise<CheckOrderPaymentResponse> => {
  return apiClient.post<CheckOrderPaymentResponse>('/stripe/check-order-payment', data);
};

/**
 * Helper function to format amount to cents
 */
export const formatAmountToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Helper function to format amount from cents
 */
export const formatAmountFromCents = (amount: number): string => {
  return (amount / 100).toFixed(2);
};
