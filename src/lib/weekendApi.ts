import type { WeekendRecommendation } from './apiTypes';
import { createApiClient } from './apiClient';
import { getAuthToken } from './authStorage';

export function createWeekendApi(baseUrl: string) {
  const { apiRequest } = createApiClient({
    baseUrl,
    getAuthToken,
  });

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function isGenerating(data: unknown): boolean {
    return typeof data === 'object' && data !== null && (data as { status?: string }).status === 'generating';
  }

  async function waitForWeekend(previousUuid: string | undefined) {
    const deadline = Date.now() + 180000;

    while (Date.now() < deadline) {
      await sleep(2000);

      const listed = await apiRequest<{
        recommendations: WeekendRecommendation[];
        generation_status?: string | null;
        generation_error?: string | null;
      }>('/weekend-recommendations');

      if (listed.data.generation_status === 'failed') {
        throw { message: listed.data.generation_error || 'Unable to generate weekend picks.' };
      }

      const latest = listed.data.recommendations[0];

      if (latest && latest.uuid !== previousUuid && listed.data.generation_status !== 'generating') {
        return {
          data: { recommendation: latest },
          message: 'Weekend recommendations ready.',
        };
      }
    }

    throw { message: 'Your weekend is still being built. Check Weekend picks in a moment.' };
  }

  return {
    listWeekendRecommendations() {
      return apiRequest<{
        recommendations: WeekendRecommendation[];
        generation_status?: string | null;
        generation_error?: string | null;
      }>('/weekend-recommendations');
    },

    async createWeekendRecommendation(interests: string[], city?: string) {
      const body: { interests: string[]; city?: string } = { interests };

      if (city?.trim()) {
        body.city = city.trim();
      }

      const existing = await apiRequest<{ recommendations: WeekendRecommendation[] }>(
        '/weekend-recommendations',
      ).catch(() => null);
      const previousUuid = existing?.data.recommendations[0]?.uuid;

      try {
        const response = await apiRequest<{ recommendation?: WeekendRecommendation; status?: string }>(
          '/weekend-recommendations',
          {
            method: 'POST',
            body: JSON.stringify(body),
          },
        );

        if (!isGenerating(response.data) && response.data.recommendation) {
          return response as { data: { recommendation: WeekendRecommendation }; message: string };
        }
      } catch (error) {
        const message = (error as { message?: string })?.message ?? '';

        if (!message.startsWith('Unable to reach') && message !== 'Network request failed') {
          throw error;
        }
      }

      return waitForWeekend(previousUuid);
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

    inviteToWeekend(uuid: string, email: string) {
      return apiRequest<{ recommendation: WeekendRecommendation }>(
        `/weekend-recommendations/${uuid}/invite`,
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
      );
    },
  };
}

export type WeekendApi = ReturnType<typeof createWeekendApi>;
