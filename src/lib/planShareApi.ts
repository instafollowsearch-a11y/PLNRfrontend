import type { PlanSession, PlanSharePreview, PlanShareRecord } from './apiTypes';
import { createApiClient } from './apiClient';
import { getAuthToken } from './authStorage';

export function createPlanShareApi(baseUrl: string) {
  const { apiRequest } = createApiClient({
    baseUrl,
    getAuthToken,
  });

  return {
    getPlanSharePreview(token: string) {
      return apiRequest<PlanSharePreview>(`/plan-shares/${token}`);
    },

    acceptPlanShare(token: string) {
      return apiRequest<{
        member: { role: string; accepted_at: string | null };
        plan_session: PlanSession | null;
      }>(`/plan-shares/${token}/accept`, { method: 'POST' });
    },

    createPlanShare(sessionUuid: string, email: string) {
      return apiRequest<{ share: PlanShareRecord }>(`/plan-sessions/${sessionUuid}/shares`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
    },
  };
}

export type PlanShareApi = ReturnType<typeof createPlanShareApi>;
