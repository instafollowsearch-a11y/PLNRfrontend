import type { PlanSession, User } from './apiTypes';
import { createApiClient } from './apiClient';
import { getAuthToken } from './authStorage';

export type PlanLimits = {
  limit: number;
  remaining: number;
  window: string;
};

export type AdminStats = {
  users_total: number;
  admins_total: number;
  plan_sessions_today: number;
  plan_sessions_total: number;
};

export type AdminSettings = {
  free_plans_per_day?: number;
  anthropic_api_key_set?: boolean;
  anthropic_api_key_source?: string;
  anthropic_api_key_hint?: string | null;
  anthropic_model?: string;
  anthropic_model_source?: string;
  anthropic_model_env?: string;
  anthropic_url?: string;
  anthropic_url_source?: string;
  anthropic_url_env?: string;
  mail_from_address?: string | null;
  mail_from_address_source?: string;
  mail_from_address_env?: string | null;
  mail_from_name?: string | null;
  mail_from_name_source?: string;
  mail_from_name_env?: string | null;
  booking_ops_email?: string | null;
  booking_ops_email_source?: string;
  booking_ops_email_env?: string | null;
  rate_limit_ai_per_hour?: number;
  rate_limit_ai_per_hour_source?: string;
  rate_limit_ai_per_hour_env?: number;
};

export type AdminSettingsUpdate = {
  free_plans_per_day?: number;
  anthropic_api_key?: string;
  anthropic_model?: string;
  anthropic_url?: string;
  mail_from_address?: string;
  mail_from_name?: string;
  booking_ops_email?: string;
  rate_limit_ai_per_hour?: number;
  clear_anthropic_api_key?: boolean;
  clear_anthropic_model?: boolean;
  clear_anthropic_url?: boolean;
  clear_mail_from_address?: boolean;
  clear_mail_from_name?: boolean;
  clear_booking_ops_email?: boolean;
  clear_rate_limit_ai_per_hour?: boolean;
};

export type PaginatedMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export function createAccountApi(baseUrl: string) {
  const { apiRequest } = createApiClient({
    baseUrl,
    getAuthToken,
  });

  return {
    listPlanSessions(page = 1) {
      return apiRequest<{ plan_sessions: PlanSession[]; meta: PaginatedMeta }>(
        `/plan-sessions?page=${page}`,
      );
    },

    claimPlanSession(sessionUuid: string) {
      return apiRequest<{ plan_session: PlanSession }>(`/plan-sessions/${sessionUuid}/claim`, {
        method: 'POST',
      });
    },

    getPlanLimits() {
      return apiRequest<PlanLimits>('/plan-limits');
    },

    getAdminStats() {
      return apiRequest<AdminStats>('/admin/stats');
    },

    listUsers(search = '', page = 1) {
      const params = new URLSearchParams({ page: String(page) });

      if (search.trim()) {
        params.set('search', search.trim());
      }

      return apiRequest<{ users: User[]; meta: PaginatedMeta }>(`/admin/users?${params.toString()}`);
    },

    updateUserRole(userId: number, role: User['role']) {
      return apiRequest<{ user: User }>(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    },

    getAdminSettings() {
      return apiRequest<{ settings: AdminSettings }>('/admin/settings');
    },

    updateAdminSettings(settings: AdminSettingsUpdate) {
      return apiRequest<{ settings: AdminSettings }>('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
    },
  };
}

export type AccountApi = ReturnType<typeof createAccountApi>;
