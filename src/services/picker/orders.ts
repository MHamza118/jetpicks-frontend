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
  getPickerOrders: (status?: string, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const queryString = params.toString();
    return apiClient.get<PickerOrdersResponse>(`/orders/picker/history${queryString ? '?' + queryString : ''}`);
  },
};
