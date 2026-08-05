import { describe, expect, it } from 'vitest';

import { formatProPrice, parseBillingConfig } from './billingHelpers';

describe('billingHelpers', () => {
  it('parses valid billing config payloads', () => {
    expect(
      parseBillingConfig({
        pro_monthly_price_cents: 999,
        pro_currency: 'usd',
        app_store_url: 'https://apps.apple.com/app/plnr',
        play_store_url: null,
        web_app_url: 'https://plnr.app',
      }),
    ).toEqual({
      pro_monthly_price_cents: 999,
      pro_currency: 'usd',
      app_store_url: 'https://apps.apple.com/app/plnr',
      play_store_url: null,
      web_app_url: 'https://plnr.app',
      stripe_fake: false,
      stripe_configured: false,
    });
  });

  it('returns null for invalid billing config payloads', () => {
    expect(parseBillingConfig(null)).toBeNull();
    expect(parseBillingConfig({ pro_currency: 'usd' })).toBeNull();
    expect(parseBillingConfig({ pro_monthly_price_cents: '999', pro_currency: 'usd' })).toBeNull();
  });

  it('formats pro monthly price', () => {
    expect(formatProPrice(999, 'usd')).toMatch(/\$9\.99/);
  });
});
