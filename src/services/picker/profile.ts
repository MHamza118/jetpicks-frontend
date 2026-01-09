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

export interface TravelJourney {
  id: string;
  departure_country: string;
  departure_city: string;
  departure_date: string;
  arrival_country: string;
  arrival_city: string;
  arrival_date: string;
  luggage_weight_capacity: string;
  created_at: string;
}

export interface PayoutMethod {
  id: string;
  method_type: 'BANK_ACCOUNT' | 'PAYPAL' | 'MOBILE_WALLET';
  is_default: boolean;
  bank_name?: string;
  account_number?: string;
  paypal_email?: string;
  wallet_type?: string;
  wallet_mobile_number?: string;
  created_at: string;
}

export const pickerProfileApi = {
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
    return apiClient.get<{ data: UserSettings }>('/user/settings');
  },

  // Update user settings
  updateSettings: (data: Partial<UserSettings>) => {
    return apiClient.put<{ message: string; data: UserSettings }>('/user/settings', data);
  },

  // Get travel journeys
  getTravelJourneys: () => {
    return apiClient.get<{ data: TravelJourney[] }>('/travel-journeys');
  },

  // Create travel journey
  createTravelJourney: (data: {
    departure_country: string;
    departure_city: string;
    departure_date: string;
    arrival_country: string;
    arrival_city: string;
    arrival_date: string;
    luggage_weight_capacity: string;
  }) => {
    return apiClient.post<{ message: string; data: TravelJourney }>('/travel-journeys', data);
  },

  // Update travel journey
  updateTravelJourney: (journeyId: string, data: { luggage_weight_capacity: string }) => {
    return apiClient.put<{ message: string; data: TravelJourney }>(`/travel-journeys/${journeyId}`, data);
  },

  // Get payout methods
  getPayoutMethods: () => {
    return apiClient.get<{ data: PayoutMethod[] }>('/payout-methods');
  },

  // Create payout method
  createPayoutMethod: (data: {
    method_type: 'BANK_ACCOUNT' | 'PAYPAL' | 'MOBILE_WALLET';
    is_default?: boolean;
    bank_name?: string;
    account_number?: string;
    paypal_email?: string;
    wallet_type?: string;
    wallet_mobile_number?: string;
  }) => {
    return apiClient.post<{ message: string; data: PayoutMethod }>('/payout-methods', data);
  },

  // Update payout method
  updatePayoutMethod: (id: string, data: Partial<PayoutMethod>) => {
    return apiClient.put<{ message: string; data: PayoutMethod }>(`/payout-methods/${id}`, data);
  },

  // Delete payout method
  deletePayoutMethod: (id: string) => {
    return apiClient.delete(`/payout-methods/${id}`);
  },

  // Set default payout method
  setDefaultPayoutMethod: (id: string) => {
    return apiClient.put<{ message: string; data: PayoutMethod }>(`/payout-methods/${id}/set-default`, {});
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
