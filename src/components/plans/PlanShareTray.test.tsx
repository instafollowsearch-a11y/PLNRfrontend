import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PlanShareTray } from './PlanShareTray';

const planUrl = 'https://myplnr.app/plan/night_out/itinerary?session=abc';

describe('PlanShareTray', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the share actions and copies the plan link', async () => {
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const onEmail = vi.fn();
    const onInvite = vi.fn();

    render(
      <PlanShareTray
        sessionUuid="abc"
        planType="night_out"
        title="Jazz night"
        canInvite
        onEmail={onEmail}
        onInvite={onInvite}
      />,
    );

    expect(screen.getByRole('button', { name: 'Invite' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Email' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Message' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'WhatsApp' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Share' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Invite' }));
    expect(onInvite).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Email' }));
    expect(onEmail).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(planUrl);
    });
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
  });

  it('hides invite when this person cannot share the plan', () => {
    render(
      <PlanShareTray
        sessionUuid="abc"
        planType="night_out"
        title="Jazz night"
        canInvite={false}
        onEmail={vi.fn()}
        onInvite={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Email' })).toBeTruthy();
  });
});
