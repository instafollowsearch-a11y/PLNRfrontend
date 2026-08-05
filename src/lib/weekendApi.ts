import type { WeekendRecommendation } from './apiTypes';
import { createApiClient } from './apiClient';
import { getAuthToken } from './authStorage';

export function createWeekendApi(baseUrl: string) {
  const { apiRequest } = createApiClient({
    baseUrl,
    getAuthToken,
  });

  return {
    listWeekendRecommendations() {
      return apiRequest<{ recommendations: WeekendRecommendation[] }>('/weekend-recommendations');
    },

    createWeekendRecommendation(interests: string[], city?: string) {
      const body: { interests: string[]; city?: string } = { interests };

      if (city?.trim()) {
        body.city = city.trim();
      }

      return apiRequest<{ recommendation: WeekendRecommendation }>('/weekend-recommendations', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    getWeekendRecommendation(uuid: string) {
      return apiRequest<{ recommendation: WeekendRecommendation }>(
        `/weekend-recommendations/${uuid}`,
      );
    },

    sendWeekendEmail(uuid: string) {
      return apiRequest<{ recommendation: WeekendRecommendation }>(
        `/weekend-recommendations/${uuid}/send-email`,
        { method: 'POST' },
      );
    },
  };
}

export type WeekendApi = ReturnType<typeof createWeekendApi>;
