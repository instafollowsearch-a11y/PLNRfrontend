import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SharePlanModal } from './SharePlanModal';

vi.mock('../../lib/api', () => ({
  planShareApi: {
    createPlanShare: vi.fn(),
  },
}));

import { planShareApi } from '../../lib/api';

describe('SharePlanModal', () => {
  it('sends the email invite when the phone field is empty', async () => {
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
    expect(screen.getByLabelText('Mobile number (optional)')).toHaveValue('');

    fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));

    await waitFor(() => {
      expect(planShareApi.createPlanShare).toHaveBeenCalledWith('session-1', 'friend@plnr.test', undefined);
    });
    expect(await screen.findByText(/invite sent to/i)).toBeInTheDocument();
    expect(screen.queryByText(/text was sent/i)).not.toBeInTheDocument();
  });
});
