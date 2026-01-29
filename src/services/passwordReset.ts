import { apiClient } from './apiClient';

export const passwordResetApi = {
  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, email: string, password: string, passwordConfirmation: string) => {
    return apiClient.post('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
  },
};
