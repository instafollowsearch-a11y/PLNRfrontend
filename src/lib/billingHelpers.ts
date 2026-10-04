import type { BillingConfig } from './apiTypes';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Parses billing config payload from the API `data` object.
 */
export function parseBillingConfig(data: unknown): BillingConfig | null {
  if (!isRecord(data)) {
    return null;
  }

  const cents = data.pro_monthly_price_cents;
  const currency = data.pro_currency;

  if (typeof cents !== 'number' || !Number.isFinite(cents) || typeof currency !== 'string') {
    return null;
  }

  return {
    pro_monthly_price_cents: cents,
    pro_currency: currency,
    app_store_url: typeof data.app_store_url === 'string' ? data.app_store_url : null,
    play_store_url: typeof data.play_store_url === 'string' ? data.play_store_url : null,
    web_app_url: typeof data.web_app_url === 'string' ? data.web_app_url : null,
    stripe_fake: data.stripe_fake === true,
    stripe_configured: data.stripe_configured === true,
  };
}

/**
 * Formats Pro monthly price for display.
 */
export function formatProPrice(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/**
 * Builds checkout success and cancel URLs for the current page.
 */
export function billingReturnUrls(pathname: string): { successUrl: string; cancelUrl: string } {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return {
    successUrl: `${origin}${path}?billing=success`,
    cancelUrl: `${origin}${path}?billing=cancel`,
  };
}

/** Clean return URL for Stripe Customer Portal (no pre-set billing query). */
/** Shows the API reason when checkout cannot start. */
export function checkoutErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;

    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }
  }

  return 'Stripe is not configured. Add a secret key in Admin → Settings.';
}

export function billingPortalReturnUrl(pathname: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return `${origin}${path}`;
}
