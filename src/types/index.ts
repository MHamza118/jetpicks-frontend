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
  username: string;
  email: string;
  phone: string;
  role: 'orderer' | 'picker';
  nationality: string;
  languages: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  phone: string;
  password: string;
  role: 'orderer' | 'picker';
}

export interface ProfileSetupPayload {
  nationality: string;
  languages: string[];
  avatar?: File;
}
