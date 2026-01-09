import { apiClient } from '../apiClient';

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  country: string;
  avatar_url?: string;
  languages: string[];
}

export interface UserSettings {
  push_notifications_enabled: boolean;
  in_app_notifications_enabled: boolean;
  message_notifications_enabled: boolean;
  location_services_enabled: boolean;
  translation_language: string;
  auto_translate_messages: boolean;
  show_original_and_translated: boolean;
}

export interface PaymentMethod {
  id: string;
  method_type: 'CARD' | 'PAYPAL' | 'WALLET';
  card_holder_name?: string;
  card_last_four?: string;
  card_brand?: string;
  expiry_month?: string;
  expiry_year?: string;
  paypal_email?: string;
  is_default: boolean;
  created_at: string;
}

export const ordererProfileApi = {
  // Get user profile
  getProfile: () => {
    return apiClient.get<{ data: UserProfile }>('/user/profile');
  },

  // Update user profile
  updateProfile: (data: {
    full_name?: string;
    phone_number?: string;
    country?: string;
    image?: File;
    languages?: string[];
  }) => {
    const formData = new FormData();
    if (data.full_name) formData.append('full_name', data.full_name);
    if (data.phone_number) formData.append('phone_number', data.phone_number);
    if (data.country) formData.append('country', data.country);
    if (data.image) formData.append('image', data.image);
    if (data.languages) {
      data.languages.forEach((lang) => {
        formData.append('languages[]', lang);
      });
    }
    return apiClient.post<{ message: string; data: UserProfile }>('/user/profile', formData);
  },

  // Get user settings
  getSettings: () => {
    return apiClient.get<{ data: UserSettings }>('/orderer/settings');
  },

  // Update user settings
  updateSettings: (data: Partial<UserSettings>) => {
    return apiClient.put<{ message: string; data: UserSettings }>('/orderer/settings', data);
  },

  // Get payment methods
  getPaymentMethods: (limit: number = 20, page: number = 1) => {
    return apiClient.get<{
      data: PaymentMethod[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        has_more: boolean;
      };
    }>(`/payment-methods?limit=${limit}&page=${page}`);
  },

  // Create payment method
  createPaymentMethod: (data: {
    method_type: 'CARD' | 'PAYPAL' | 'WALLET';
    card_holder_name?: string;
    card_number?: string;
    expiry_month?: string;
    expiry_year?: string;
    cvv?: string;
    paypal_email?: string;
    is_default?: boolean;
  }) => {
    return apiClient.post<{ data: PaymentMethod }>('/payment-methods', data);
  },

  // Update payment method
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => {
    return apiClient.put<{ data: PaymentMethod }>(`/payment-methods/${id}`, data);
  },

  // Delete payment method
  deletePaymentMethod: (id: string) => {
    return apiClient.delete(`/payment-methods/${id}`);
  },

  // Set default payment method
  setDefaultPaymentMethod: (id: string) => {
    return apiClient.put<{ data: PaymentMethod }>(`/payment-methods/${id}/set-default`, {});
  },

  // Add language
  addLanguage: (languageName: string) => {
    return apiClient.post<{ message: string; data: { id: string; language_name: string } }>('/user/languages', {
      language_name: languageName,
    });
  },

  // Remove language
  removeLanguage: (languageId: string) => {
    return apiClient.delete(`/user/languages/${languageId}`);
  },

  // Update languages
  updateLanguages: (languages: string[]) => {
    return apiClient.put<{ message: string; data: UserProfile }>('/user/languages', {
      languages,
    });
  },

  // Change password
  changePassword: (newPassword: string, newPasswordConfirmation: string) => {
    return apiClient.post<{ message: string }>('/user/change-password', {
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
  },
};
