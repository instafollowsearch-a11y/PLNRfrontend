import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SharePlanModal } from './SharePlanModal';

vi.mock('../../lib/api', () => ({
  billingApi: {
    getBillingConfig: vi.fn(),
  },
  planShareApi: {
    createPlanShare: vi.fn(),
  },
}));

import { billingApi, planShareApi } from '../../lib/api';

describe('SharePlanModal', () => {
  it('hides the phone field when plan invite SMS is disabled', async () => {
    vi.mocked(billingApi.getBillingConfig).mockResolvedValue({
      data: {
        pro_monthly_price_cents: 999,
        pro_currency: 'usd',
        app_store_url: null,
        play_store_url: null,
        web_app_url: null,
        plan_invite_sms_enabled: false,
      },
      message: 'Billing configuration retrieved.',
    });
    vi.mocked(planShareApi.createPlanShare).mockResolvedValue({
      data: {
        share: {
          token: 'share-token',
          invitee_email: 'friend@plnr.test',
          status: 'pending',
          expires_at: null,
          sms_sent: false,
        },
      },
      message: 'Plan invite sent.',
    });

    render(<SharePlanModal sessionUuid="session-1" onClose={() => undefined} />);

    fireEvent.change(screen.getByLabelText('Invitee email'), {
      target: { value: 'friend@plnr.test' },
    });
    await waitFor(() => {
      expect(screen.queryByLabelText('Mobile number (optional)')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));

    await waitFor(() => {
      expect(planShareApi.createPlanShare).toHaveBeenCalledWith('session-1', 'friend@plnr.test', undefined);
    });
    expect(await screen.findByText(/invite sent to/i)).toBeInTheDocument();
  });

  it('shows the phone field when plan invite SMS is enabled', async () => {
    vi.mocked(billingApi.getBillingConfig).mockResolvedValue({
      data: {
        pro_monthly_price_cents: 999,
        pro_currency: 'usd',
        app_store_url: null,
        play_store_url: null,
        web_app_url: null,
        plan_invite_sms_enabled: true,
      },
      message: 'Billing configuration retrieved.',
    });

    render(<SharePlanModal sessionUuid="session-1" onClose={() => undefined} />);

    expect(await screen.findByLabelText('Mobile number (optional)')).toBeInTheDocument();
  });
});
