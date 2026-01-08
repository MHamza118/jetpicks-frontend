import { apiClient } from './apiClient';
import type { AuthResponse, LoginPayload, SignupPayload } from '../@types/index';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', payload),

  register: (payload: SignupPayload) =>
    apiClient.post<AuthResponse>('/auth/register', payload),

  logout: () =>
    apiClient.post('/auth/logout'),

  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};
