import { apiClient } from './apiClient';

export interface Country {
  name: string;
  code: string;
  cities: string[];
}

export const locationsApi = {
  getCountries: async (): Promise<{ [key: string]: Country }> => {
    return await apiClient.get('/locations/countries');
  },

  getCities: async (countryCode: string): Promise<string[]> => {
    return await apiClient.get(`/locations/cities/${countryCode}`);
  },
};
