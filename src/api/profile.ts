import { apiClient } from './client';
import type { User, ProfileSetupPayload } from '../@types/index';

interface ProfileResponse {
  data: User;
}

export const profileApi = {
  getProfile: () =>
    apiClient.get<ProfileResponse>('/user/profile'),

  updateProfile: (payload: Partial<User>) =>
    apiClient.put<ProfileResponse>('/user/profile', payload),

  setupProfile: (payload: ProfileSetupPayload) =>
    apiClient.post<ProfileResponse>('/user/profile', payload),
};
