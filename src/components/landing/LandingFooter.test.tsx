import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LandingFooter } from './LandingFooter';

function billingConfig(appStoreUrl: string | null, playStoreUrl: string | null): Response {
  return new Response(
    JSON.stringify({
      data: {
        pro_monthly_price_cents: 999,
        pro_currency: 'usd',
        app_store_url: appStoreUrl,
        play_store_url: playStoreUrl,
        web_app_url: 'http://localhost:5173',
      },
      message: 'ok',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

describe('LandingFooter store buttons', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows both buttons disabled when the store urls are empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(billingConfig(null, null)));

    render(
      <MemoryRouter>
        <LandingFooter />
      </MemoryRouter>,
    );

    const appStore = await screen.findByRole('button', { name: 'App Store' });
    const playStore = await screen.findByRole('button', { name: 'Google Play' });

    expect(appStore).toBeDisabled();
    expect(playStore).toBeDisabled();
    expect(screen.queryByRole('link', { name: 'App Store' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Google Play' })).toBeNull();
  });

  it('turns a button into a new-tab link when that url is set', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        billingConfig('https://apps.apple.com/app/plnr', null),
      ),
    );

    render(
      <MemoryRouter>
        <LandingFooter />
      </MemoryRouter>,
    );

    const appStore = await screen.findByRole('link', { name: 'App Store' });

    await waitFor(() => {
      expect(appStore).toHaveAttribute('href', 'https://apps.apple.com/app/plnr');
    });
    expect(appStore).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('button', { name: 'Google Play' })).toBeDisabled();
  });
});
