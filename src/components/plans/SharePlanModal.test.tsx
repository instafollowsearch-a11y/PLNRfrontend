import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SharePlanModal } from './SharePlanModal';

describe('SharePlanModal', () => {
  it('shows invitation channel icons instead of email fields', () => {
    render(
      <SharePlanModal
        sessionUuid="session-1"
        planType="night_out"
        title="Jazz night"
        onClose={() => undefined}
      />,
    );

    expect(screen.getByRole('heading', { name: /send invitation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /message/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/invitee email/i)).not.toBeInTheDocument();
  });

  it('closes from the close button', () => {
    const onClose = vi.fn();
    render(
      <SharePlanModal
        sessionUuid="session-1"
        planType="night_out"
        title="Jazz night"
        onClose={onClose}
      />,
    );

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    closeButtons[closeButtons.length - 1].click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
