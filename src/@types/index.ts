// Global API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

// User Types
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  roles: ('ORDERER' | 'PICKER')[];
  country?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  roles: ('ORDERER' | 'PICKER')[];
}

export interface ProfileSetupPayload {
  nationality: string;
  languages: string[];
  avatar?: File;
}

export interface TravelJourneyPayload {
  departure_country: string;
  departure_city: string;
  departure_date: string;
  arrival_country: string;
  arrival_city: string;
  arrival_date: string;
  luggage_weight_capacity: string;
}

export interface TravelJourney {
  id: string;
  user_id: string;
  departure_country: string;
  departure_city: string;
  departure_date: string;
  arrival_country: string;
  arrival_city: string;
  arrival_date: string;
  luggage_weight_capacity: string;
  created_at: string;
}
