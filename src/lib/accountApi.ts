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
  free_plans_per_month?: number;
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
  pro_monthly_price_cents?: number;
  pro_monthly_price_cents_source?: string;
  pro_monthly_price_cents_env?: number;
  pro_currency?: string;
  pro_currency_source?: string;
  pro_currency_env?: string;
  app_store_url?: string | null;
  app_store_url_source?: string;
  app_store_url_env?: string | null;
  play_store_url?: string | null;
  play_store_url_source?: string;
  play_store_url_env?: string | null;
  web_app_url?: string | null;
  web_app_url_source?: string;
  web_app_url_env?: string | null;
  stripe_secret_set?: boolean;
  stripe_secret_source?: string;
  stripe_secret_hint?: string | null;
  stripe_publishable_key?: string | null;
  stripe_publishable_key_source?: string;
  stripe_publishable_key_env?: string | null;
  stripe_webhook_secret_set?: boolean;
  stripe_webhook_secret_source?: string;
  stripe_webhook_secret_hint?: string | null;
  stripe_fake?: boolean;
  stripe_fake_source?: string;
  stripe_fake_env?: boolean;
};

export type AdminSettingsUpdate = {
  free_plans_per_month?: number;
  anthropic_api_key?: string;
  anthropic_model?: string;
  anthropic_url?: string;
  mail_from_address?: string;
  mail_from_name?: string;
  booking_ops_email?: string;
  rate_limit_ai_per_hour?: number;
  pro_monthly_price_cents?: number;
  pro_currency?: string;
  app_store_url?: string;
  play_store_url?: string;
  web_app_url?: string;
  stripe_secret?: string;
  stripe_publishable_key?: string;
  stripe_webhook_secret?: string;
  stripe_fake?: boolean;
  clear_anthropic_api_key?: boolean;
  clear_anthropic_model?: boolean;
  clear_anthropic_url?: boolean;
  clear_mail_from_address?: boolean;
  clear_mail_from_name?: boolean;
  clear_booking_ops_email?: boolean;
  clear_rate_limit_ai_per_hour?: boolean;
  clear_pro_currency?: boolean;
  clear_app_store_url?: boolean;
  clear_play_store_url?: boolean;
  clear_web_app_url?: boolean;
  clear_stripe_secret?: boolean;
  clear_stripe_publishable_key?: boolean;
  clear_stripe_webhook_secret?: boolean;
  clear_stripe_fake?: boolean;
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
