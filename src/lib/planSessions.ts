import type { PlanTypeSlug } from '../constants/planFlowConfig';
import type { PlanSession, Suggestion } from './apiTypes';
import { createApiClient, type ApiClientConfig } from './apiClient';

export function createPlanSessionApi(config: ApiClientConfig) {
  const { apiRequest } = createApiClient(config);

  return {
    createPlanSession(planType: PlanTypeSlug, answers: Record<string, unknown>) {
      return apiRequest<{ plan_session: PlanSession }>('/plan-sessions', {
        method: 'POST',
        body: JSON.stringify({ plan_type: planType, answers }),
      });
    },

    generateSuggestions(sessionUuid: string) {
      return apiRequest<{ plan_session: PlanSession; suggestions: Suggestion[] }>(
        `/plan-sessions/${sessionUuid}/suggestions`,
        { method: 'POST' },
      );
    },

    getPlanSession(sessionUuid: string) {
      return apiRequest<{ plan_session: PlanSession }>(`/plan-sessions/${sessionUuid}`);
    },

    refinePlanSession(sessionUuid: string, message: string) {
      return apiRequest<{ plan_session: PlanSession; suggestions: Suggestion[] }>(
        `/plan-sessions/${sessionUuid}/refine`,
        {
          method: 'POST',
          body: JSON.stringify({ message }),
        },
      );
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
      return apiRequest<{ plan_session: PlanSession; itinerary: PlanSession['itinerary'] }>(
        `/plan-sessions/${sessionUuid}/itinerary`,
        { method: 'POST' },
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
