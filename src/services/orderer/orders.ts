import { apiClient } from '../apiClient';

export interface OrdererOrder {
  id: string;
  origin_city: string;
  destination_city: string;
  status: 'PENDING' | 'ACCEPTED' | 'DELIVERED' | 'CANCELLED';
  items_count: number;
  total_cost: number;
  created_at: string;
}

export interface OrdererOrderDetails {
  id: string;
  orderer_id: string;
  assigned_picker_id?: string;
  origin_city: string;
  destination_city: string;
  status: string;
  items_count: number;
  items_cost: number;
  reward_amount: number;
  accepted_counter_offer_amount?: number;
  items: Array<{
    id: string;
    item_name: string;
    weight: string;
    price: number;
    quantity: number;
    special_notes?: string;
    store_link?: string;
    product_images?: string[];
  }>;
  picker?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  created_at: string;
}

export const ordererOrdersApi = {
  getOrders: async (status?: string, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get(`/orders?${params.toString()}`);
    return response;
  },

  getOrderDetails: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response;
  },

  cancelOrder: async (orderId: string) => {
    const response = await apiClient.delete(`/orders/${orderId}`);
    return response;
  },

  confirmDelivery: async (orderId: string) => {
    const response = await apiClient.put(`/orders/${orderId}/confirm-delivery`);
    return response;
  },

  reportIssue: async (orderId: string, reason: string) => {
    const response = await apiClient.put(`/orders/${orderId}/report-issue`, {
      reason,
    });
    return response;
  },

  submitReview: async (orderId: string, rating: number, comment: string, revieweeId: string) => {
    const response = await apiClient.post('/reviews', {
      order_id: orderId,
      rating,
      comment,
      reviewee_id: revieweeId,
    });
    return response;
  },

  submitTip: async (orderId: string, amount: number) => {
    const response = await apiClient.post('/tips', {
      order_id: orderId,
      amount,
    });
    return response;
  },
};
