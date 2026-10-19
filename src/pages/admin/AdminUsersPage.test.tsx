import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../../contexts/AuthContext';
import { accountApi, authApi } from '../../lib/api';
import { clearAuthToken } from '../../lib/authStorage';
import { AdminUsersPage } from './AdminUsersPage';

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
      ...actual.accountApi,
      listUsers: vi.fn(),
      sendTestNotification: vi.fn(),
      updateUserRole: vi.fn(),
    },
  };
});

const emptyMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 1,
};

describe('AdminUsersPage', () => {
  afterEach(() => {
    cleanup();
    clearAuthToken();
    vi.mocked(authApi.me).mockReset();
    vi.mocked(authApi.me).mockRejectedValue(new Error('no session'));
  });

  it('sends a test notification for a user', async () => {
    vi.mocked(accountApi.listUsers).mockResolvedValue({
      data: {
        users: [
          {
            id: 8,
            name: 'Ada Lovelace',
            email: 'ada@plnr.test',
            city: 'Austin',
            role: 'user',
            is_pro: true,
            push_token_count: 1,
          },
        ],
        meta: emptyMeta,
      },
      message: 'Users retrieved.',
    });
    vi.mocked(accountApi.sendTestNotification).mockResolvedValue({
      data: { sent: true, token_count: 1 },
      message: 'Test notification sent.',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminUsersPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('ada@plnr.test')).toBeTruthy();
    expect(screen.getByText('1 push token')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Send test notification' }));

    await waitFor(() => {
      expect(accountApi.sendTestNotification).toHaveBeenCalledWith(8);
    });
    expect(await screen.findByText('Test notification sent.')).toBeTruthy();
  });
});
