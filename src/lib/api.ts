import { createPlanSessionApi } from './planSessions';

const defaultApiUrl = 'http://localhost:8088/api/v1';

export const API_URL = import.meta.env.VITE_API_URL ?? defaultApiUrl;

export const planSessionApi = createPlanSessionApi({
  baseUrl: API_URL,
});

export const PRIVACY_POLICY_URL =
  import.meta.env.VITE_PRIVACY_POLICY_URL ?? 'https://plnr.app/privacy';

export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@plnr.app';

export type { PlanSession, Suggestion, ItineraryContent, ApiError, ApiResponse } from './apiTypes';
export type { PlanSessionApi } from './planSessions';
export { createPlanSessionApi } from './planSessions';
