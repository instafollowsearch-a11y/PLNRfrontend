import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { authApi } from '../lib/api';
import type { User } from '../lib/apiTypes';
import { clearAuthToken, setAuthToken } from '../lib/authStorage';
import { AccountPage } from './AccountPage';

vi.mock('../components/fields/LocationField', () => ({
  LocationField: () => <div>City map</div>,
}));

vi.mock('../lib/authStorage', () => {
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

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');

  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      me: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
    },
    accountApi: {
      ...actual.accountApi,
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

describe('AccountPage', () => {
  afterEach(() => {
    cleanup();
    clearAuthToken();
  });

  it('asks for the current password only after the email changes', async () => {
    setAuthToken('test-token');
    vi.mocked(authApi.me).mockResolvedValue({
      data: { user: signedInUser },
      message: 'User retrieved successfully.',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    const details = await screen.findByRole('form', { name: /profile details/i });

    expect(await within(details).findByDisplayValue('ada@example.com')).toBeTruthy();
    expect(within(details).queryByLabelText(/current password/i)).toBeNull();

    fireEvent.change(within(details).getByLabelText(/^email$/i), {
      target: { value: 'grace@example.com' },
    });

    expect(within(details).getByLabelText(/current password/i)).toHaveAttribute('type', 'password');
  });

  it('saves a changed interest list', async () => {
    setAuthToken('test-token');
    vi.mocked(authApi.me).mockResolvedValue({
      data: { user: { ...signedInUser, interests: ['Live music'] } },
      message: 'User retrieved successfully.',
    });
    vi.mocked(authApi.updateProfile).mockResolvedValue({
      data: {
        user: { ...signedInUser, interests: ['Live music', 'Pottery'] },
        weekend_delivery: 'skipped',
      },
      message: 'Profile updated successfully.',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AccountPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    const details = await screen.findByRole('form', { name: /profile details/i });
    fireEvent.change(within(details).getByPlaceholderText('Add your own…'), {
      target: { value: 'Pottery' },
    });
    fireEvent.click(within(details).getByRole('button', { name: 'Add' }));
    fireEvent.submit(details);

    expect(authApi.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        interests: ['Live music', 'Pottery'],
      }),
    );
  });
});
