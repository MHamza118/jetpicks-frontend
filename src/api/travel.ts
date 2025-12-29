import { apiClient } from './client';
import type { TravelJourneyPayload, TravelJourney } from '../@types/index';

export const travelApi = {
  createJourney: (payload: TravelJourneyPayload) =>
    apiClient.post<{ message: string; data: TravelJourney }>('/travel-journeys', payload),

  getJourneys: () =>
    apiClient.get<{ data: TravelJourney[] }>('/travel-journeys'),
};
