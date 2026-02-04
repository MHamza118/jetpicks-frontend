import { apiClient } from './apiClient';

export interface TravelJourney {
  id: string;
  departure_country: string;
  departure_city: string;
  departure_date: string;
  arrival_country: string;
  arrival_city: string;
  arrival_date: string;
  luggage_weight_capacity: number;
}

export interface SearchPickerResult {
  id: string;
  full_name: string;
  avatar_url?: string;
  rating: number;
  completed_orders: number;
  journeys_count: number;
  travelJourneys?: TravelJourney[];
}

export interface SearchOrderResult {
  id: string;
  orderer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  items_count: number;
  items_cost: number;
  reward_amount: number;
  status: string;
  created_at: string;
}

export interface SearchResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export const searchApi = {
  // Search for pickers by name and travel routes
  searchPickers: (
    query: string,
    originCity?: string,
    destinationCity?: string,
    page: number = 1,
    limit: number = 20
  ) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (originCity) params.append('origin_city', originCity);
    if (destinationCity) params.append('destination_city', destinationCity);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return apiClient.get<SearchResponse<SearchPickerResult>>(
      `/search/pickers?${params.toString()}`
    );
  },

  // Search for orders by query and filters
  searchOrders: (
    query: string,
    status?: string,
    minReward?: number,
    maxReward?: number,
    page: number = 1,
    limit: number = 20
  ) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status) params.append('status', status);
    if (minReward !== undefined) params.append('min_reward', minReward.toString());
    if (maxReward !== undefined) params.append('max_reward', maxReward.toString());
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return apiClient.get<SearchResponse<SearchOrderResult>>(
      `/search/orders?${params.toString()}`
    );
  },
};
