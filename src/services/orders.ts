import { apiClient } from './apiClient';

export interface CreateOrderPayload {
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  special_notes?: string;
  picker_id?: string;
}

export interface AddOrderItemPayload {
  item_name: string;
  weight: string;
  price: number;
  quantity?: number;
  special_notes?: string;
  store_link?: string;
  product_images?: string[];
}

export interface SetOrderRewardPayload {
  reward_amount: number;
}

export const ordersApi = {
  createOrder: (data: CreateOrderPayload) =>
    apiClient.post('/orders', data),

  addOrderItem: (orderId: string, data: AddOrderItemPayload | FormData) =>
    apiClient.post(`/orders/${orderId}/items`, data),

  setReward: (orderId: string, data: SetOrderRewardPayload) =>
    apiClient.put(`/orders/${orderId}/reward`, data),

  acceptDelivery: (orderId: string) =>
    apiClient.put(`/orders/${orderId}/accept`, {}),

  getOrders: (status?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const queryString = params.toString();
    return apiClient.get(`/orders${queryString ? '?' + queryString : ''}`);
  },

  getOrderDetails: (orderId: string) =>
    apiClient.get(`/orders/${orderId}`),

  cancelOrder: (orderId: string) =>
    apiClient.delete(`/orders/${orderId}`),

  acceptOffer: (offerId: string) =>
    apiClient.put(`/offers/${offerId}/accept`, {}),

  rejectOffer: (offerId: string) =>
    apiClient.put(`/offers/${offerId}/reject`, {}),

  getOfferHistory: (orderId: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const queryString = params.toString();
    return apiClient.get(`/orders/${orderId}/offers${queryString ? '?' + queryString : ''}`);
  },
};
