import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../../contexts/AuthContext';
import { AppShell } from './AppShell';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    authApi: {
      me: vi.fn().mockRejectedValue(new Error('no session')),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    },
    accountApi: {
      claimPlanSession: vi.fn(),
    },
  };
});

describe('AppShell', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders desktop account links for guests on landing', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AppShell variant="landing">
            <div>content</div>
          </AppShell>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('navigation', { name: /account navigation/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /^log in$/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /create account/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /open menu/i })).toBeTruthy();
  });

  it('keeps brand logo when showBack is set', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AppShell title="Plan" showBack backTo="/">
            <div>content</div>
          </AppShell>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /^plnr$/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /go back/i })).toBeTruthy();
  });
});
