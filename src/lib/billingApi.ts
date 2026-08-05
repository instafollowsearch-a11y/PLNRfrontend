import type { BillingConfig } from './apiTypes';
import { createApiClient } from './apiClient';
import { getAuthToken } from './authStorage';

export function createBillingApi(baseUrl: string) {
  const { apiRequest } = createApiClient({
    baseUrl,
    getAuthToken,
  });

  return {
    getBillingConfig() {
      return apiRequest<BillingConfig>('/billing-config');
    },

    createCheckoutSession(successUrl: string, cancelUrl: string) {
      return apiRequest<{ checkout_url: string; session_id?: string }>('/billing/checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      });
    },

    createPortalSession(returnUrl: string) {
      return apiRequest<{ portal_url: string; fake?: boolean }>('/billing/portal-session', {
        method: 'POST',
        body: JSON.stringify({ return_url: returnUrl }),
      });
    },

    cancelSubscription() {
      return apiRequest<{ user: import('./apiTypes').User }>('/billing/cancel-subscription', {
        method: 'POST',
      });
    },
  };
}

export type BillingApi = ReturnType<typeof createBillingApi>;
