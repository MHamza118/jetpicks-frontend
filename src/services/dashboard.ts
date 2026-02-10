import { apiClient } from './apiClient';

export interface PickerDashboardData {
  available_orders: {
    data: {
      id: string;
      orderer: {
        id: string;
        full_name: string;
        avatar_url: string;
        rating: number;
      };
      origin_city: string;
      destination_city: string;
      earliest_delivery_date: string;
      items_count: number;
      items_cost: number;
      reward_amount: number;
      currency?: string;
      items_images: string[];
    }[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      has_more: boolean;
    };
  };
  travel_journeys: Record<string, unknown>[];
  statistics: {
    total_available_orders: number;
    active_journeys: number;
    completed_deliveries: number;
  };
}

export const dashboardApi = {
  getPickerDashboard: (page = 1, limit = 20) =>
    apiClient.get(`/dashboard/picker?page=${page}&limit=${limit}`),

  getOrdererDashboard: (page = 1, limit = 20) =>
    apiClient.get(`/dashboard/orderer?page=${page}&limit=${limit}`),
};
