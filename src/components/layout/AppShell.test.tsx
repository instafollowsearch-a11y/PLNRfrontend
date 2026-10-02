import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../../contexts/AuthContext';
import { authApi } from '../../lib/api';
import type { User } from '../../lib/apiTypes';
import { clearAuthToken, setAuthToken } from '../../lib/authStorage';
import { AppShell } from './AppShell';

vi.mock('../../lib/authStorage', () => {
  let token: string | null = null;

  return {
    getAuthToken: () => token,
    setAuthToken: (value: string) => {
      token = value;
    },
    clearAuthToken: () => {
      token = null;
    },
  };
});

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    authApi: {
      me: vi.fn().mockRejectedValue(new Error('no session')),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
    },
    accountApi: {
      claimPlanSession: vi.fn(),
    },
  };
});

const signedInUser: User = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  city: 'London',
  role: 'user',
};

describe('AppShell', () => {
  afterEach(() => {
    cleanup();
    clearAuthToken();
    vi.mocked(authApi.me).mockReset();
    vi.mocked(authApi.me).mockRejectedValue(new Error('no session'));
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

  it('shows an initials avatar for a signed-in user', async () => {
    setAuthToken('test-token');
    vi.mocked(authApi.me).mockResolvedValue({
      data: { user: signedInUser },
      message: 'User retrieved successfully.',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AppShell title="Home">
            <div>content</div>
          </AppShell>
        </AuthProvider>
      </MemoryRouter>,
    );

    const accountMenu = await screen.findByRole('button', { name: /account menu for ada lovelace/i });

    expect(accountMenu.textContent).toBe('AL');
  });
});

