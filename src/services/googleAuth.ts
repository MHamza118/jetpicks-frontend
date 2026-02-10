import { apiClient } from './apiClient';
import type { AuthResponse } from '../@types/index';

export interface GoogleLoginPayload {
  idToken: string;
}

export const googleAuthApi = {
  login: (payload: GoogleLoginPayload) =>
    apiClient.post<AuthResponse & { isNewUser: boolean }>('/auth/google-login', payload),
};
