import { apiClient } from './api';
import type { User, ProfileSetupPayload } from '../types/index';

export const profileApi = {
  getProfile: () =>
    apiClient.get<User>('/profile'),

  updateProfile: (payload: Partial<User>) =>
    apiClient.put<User>('/profile', payload),

  setupProfile: (payload: ProfileSetupPayload) =>
    apiClient.post<User>('/profile/setup', payload),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<{ avatar: string }>('/profile/avatar', formData);
  },
};
