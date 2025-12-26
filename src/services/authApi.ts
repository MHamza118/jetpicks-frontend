import { apiClient } from './api';
import type { AuthResponse, LoginPayload, SignupPayload } from '../types/index';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', payload),

  signup: (payload: SignupPayload) =>
    apiClient.post<AuthResponse>('/auth/signup', payload),

  logout: () =>
    apiClient.post('/auth/logout'),

  refreshToken: () =>
    apiClient.post<AuthResponse>('/auth/refresh'),

  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};
