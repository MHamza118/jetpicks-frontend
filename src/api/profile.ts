import { apiClient } from './client';
import type { User, ProfileSetupPayload } from '../@types/index';

export const profileApi = {
  getProfile: () =>
    apiClient.get<User>('/user/profile'),

  updateProfile: (payload: Partial<User>) =>
    apiClient.put<User>('/user/profile', payload),

  setupProfile: (payload: ProfileSetupPayload) =>
    apiClient.post<User>('/user/profile', payload),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<{ avatar: string }>('/user/profile/avatar', formData);
  },
};
