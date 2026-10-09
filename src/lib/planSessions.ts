import type { PlanTypeSlug } from '../constants/planFlowConfig';
import type { PlanSession, Suggestion } from './apiTypes';
import { createApiClient, type ApiClientConfig } from './apiClient';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGenerating(data: unknown): boolean {
  return typeof data === 'object' && data !== null && (data as { status?: string }).status === 'generating';
}

function isDisconnect(error: unknown): boolean {
  const message = (error as { message?: string })?.message ?? '';

  return message.startsWith('Unable to reach') || message === 'Network request failed';
}

export function createPlanSessionApi(config: ApiClientConfig) {
  const { apiRequest } = createApiClient(config);

  async function pollSession(
    sessionUuid: string,
    ready: (session: PlanSession) => boolean,
  ): Promise<PlanSession> {
    const deadline = Date.now() + 180000;

    while (Date.now() < deadline) {
      await sleep(2000);

      try {
        const response = await apiRequest<{ plan_session: PlanSession }>(`/plan-sessions/${sessionUuid}`);
        const session = response.data.plan_session;

        if (session.generation_status === 'failed') {
          throw { message: session.generation_error || 'Unable to finish this plan. Please try again.' };
        }

        if (!session.generation_status && ready(session)) {
          return session;
        }
      } catch (error) {
        if (!isDisconnect(error)) {
          throw error;
        }
      }
    }

    throw { message: 'Your plan is still being built. Check My Plans in a moment.' };
  }

  async function finishInBackground<T extends object>(
    sessionUuid: string,
    request: () => Promise<{ data: T; message: string }>,
    ready: (session: PlanSession) => boolean,
    pack: (session: PlanSession) => { data: T; message: string },
  ): Promise<{ data: T; message: string }> {
    try {
      const response = await request();

      if (!isGenerating(response.data)) {
        return response;
      }
    } catch (error) {
      if (!isDisconnect(error)) {
        throw error;
      }
    }

    return pack(await pollSession(sessionUuid, ready));
  }

  return {
    createPlanSession(planType: PlanTypeSlug, answers: Record<string, unknown>) {
      return apiRequest<{ plan_session: PlanSession }>('/plan-sessions', {
        method: 'POST',
        body: JSON.stringify({ plan_type: planType, answers }),
      });
    },

    generateSuggestions(sessionUuid: string) {
      return finishInBackground(
        sessionUuid,
        () =>
          apiRequest<{ plan_session: PlanSession; suggestions: Suggestion[] }>(
            `/plan-sessions/${sessionUuid}/suggestions`,
            { method: 'POST' },
          ),
        () => true,
        (session) => ({
          data: { plan_session: session, suggestions: session.suggestions ?? [] },
          message: 'Suggestions generated.',
        }),
      );
    },

    getPlanSession(sessionUuid: string) {
      return apiRequest<{ plan_session: PlanSession }>(`/plan-sessions/${sessionUuid}`);
    },

    refinePlanSession(sessionUuid: string, message: string) {
      return finishInBackground(
        sessionUuid,
        () =>
          apiRequest<{ plan_session: PlanSession; suggestions: Suggestion[] }>(
            `/plan-sessions/${sessionUuid}/refine`,
            {
              method: 'POST',
              body: JSON.stringify({ message }),
            },
          ),
        () => true,
        (session) => ({
          data: { plan_session: session, suggestions: session.suggestions ?? [] },
          message: 'Suggestions refined.',
        }),
      );
    },

    async draftSuggestionPlan(sessionUuid: string, suggestionId: number) {
      try {
        const response = await apiRequest<{ suggestion?: Suggestion; status?: string }>(
          `/plan-sessions/${sessionUuid}/suggestions/${suggestionId}/plan`,
          { method: 'POST' },
        );

        if (!isGenerating(response.data) && response.data.suggestion) {
          return response as { data: { suggestion: Suggestion }; message: string };
        }
      } catch (error) {
        if (!isDisconnect(error)) {
          throw error;
        }
      }

      const session = await pollSession(sessionUuid, (item) =>
        Boolean(item.suggestions?.find((suggestion) => suggestion.id === suggestionId)?.itinerary_content),
      );
      const suggestion = session.suggestions?.find((item) => item.id === suggestionId);

      if (!suggestion) {
        throw { message: 'Unable to finish this plan. Please try again.' };
      }

      return { data: { suggestion }, message: 'Plan drafted.' };
    },

    selectSuggestion(sessionUuid: string, suggestionId: number) {
      return apiRequest<{ plan_session: PlanSession; selected_suggestion: Suggestion }>(
        `/plan-sessions/${sessionUuid}/select`,
        {
          method: 'POST',
          body: JSON.stringify({ suggestion_id: suggestionId }),
        },
      );
    },

    generateItinerary(sessionUuid: string) {
      return finishInBackground(
        sessionUuid,
        () =>
          apiRequest<{ plan_session: PlanSession; itinerary: PlanSession['itinerary'] }>(
            `/plan-sessions/${sessionUuid}/itinerary`,
            { method: 'POST' },
          ),
        (session) => Boolean(session.itinerary),
        (session) => ({
          data: { plan_session: session, itinerary: session.itinerary },
          message: 'Itinerary generated.',
        }),
      );
    },

    sendItineraryEmail(sessionUuid: string, email: string) {
      return apiRequest<{ email: string; sent_at: string }>(
        `/plan-sessions/${sessionUuid}/send-email`,
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
      );
    },
  };
}

export type PlanSessionApi = ReturnType<typeof createPlanSessionApi>;
