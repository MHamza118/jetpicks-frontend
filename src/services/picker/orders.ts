import { apiClient } from '../apiClient';

export interface PickerOrder {
  id: string;
  orderer_id: string;
  orderer: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rating: number;
  };
  origin_city: string;
  destination_city: string;
  status: 'PENDING' | 'ACCEPTED' | 'DELIVERED' | 'CANCELLED';
  items_count: number;
  items_cost: number;
  reward_amount: number | string;
  items: Array<{
    id: string;
    item_name: string;
    product_images?: string[];
  }>;
  created_at: string;
}

export interface PickerOrderDetail extends PickerOrder {
  origin_country: string;
  destination_country: string;
  special_notes?: string;
  items: Array<{
    id: string;
    item_name: string;
    weight?: string;
    price?: number;
    quantity?: number;
    special_notes?: string;
    store_link?: string;
    product_images?: string[];
  }>;
}

export interface PickerOrdersResponse {
  data: PickerOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export const pickerOrdersApi = {
  // Get picker's order history with optional status filter
  getPickerOrders: (status?: string, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const queryString = params.toString();
    return apiClient.get<PickerOrdersResponse>(`/orders/picker/history${queryString ? '?' + queryString : ''}`);
  },

  // Get detailed information about a specific order
  getOrderDetails: (orderId: string) => {
    return apiClient.get<PickerOrderDetail>(`/orders/${orderId}`);
  },

  // Mark order as delivered with proof upload
  markDelivered: (orderId: string, proofFile: File) => {
    const formData = new FormData();
    formData.append('proof_of_delivery', proofFile);
    return apiClient.put(`/orders/${orderId}/mark-delivered`, formData);
  },

  // Confirm delivery after marking
  confirmDelivery: (orderId: string) => {
    return apiClient.put(`/orders/${orderId}/confirm-delivery`, {});
  },

  // Get delivery status
  getDeliveryStatus: (orderId: string) => {
    return apiClient.get(`/orders/${orderId}/delivery-status`);
  },

  // Report delivery issue
  reportIssue: (orderId: string, issueDescription: string) => {
    return apiClient.put(`/orders/${orderId}/report-issue`, {
      issue_description: issueDescription,
    });
  },
};
