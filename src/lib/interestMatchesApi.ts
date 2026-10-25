import { createApiClient } from './apiClient';
import { getAuthToken } from './authStorage';

export type InterestMatchEvent = {
  id: number;
  title: string;
  city: string | null;
  starts_at: string | null;
  url: string | null;
};

export type InterestMatch = {
  id: number;
  matched_interest: string;
  score: number;
  event: InterestMatchEvent | null;
};

export function createInterestMatchesApi(baseUrl: string) {
  const { apiRequest } = createApiClient({
    baseUrl,
    getAuthToken,
  });

  return {
    listInterestMatches() {
      return apiRequest<{ matches: InterestMatch[] }>('/interest-matches');
    },
  };
}

export type InterestMatchesApi = ReturnType<typeof createInterestMatchesApi>;
