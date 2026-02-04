import { apiClient } from './apiClient';

export interface Country {
  name: string;
  code: string;
}

export const locationsApi = {
  getCountries: async (): Promise<Country[]> => {
    const response = await apiClient.get<{ data: Country[] }>('/locations/countries');
    return response.data || [];
  },

  getCities: async (countryName: string): Promise<string[]> => {
    const response = await apiClient.post<{ data: string[] }>('/locations/cities', {
      country: countryName,
    });
    return response.data || [];
  },
};
