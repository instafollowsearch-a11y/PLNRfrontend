import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { authApi } from '../lib/api';
import type { User } from '../lib/apiTypes';
import { clearAuthToken, setAuthToken } from '../lib/authStorage';
import { ProSetupPage } from './ProSetupPage';

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

vi.mock('../components/fields/LocationField', () => ({
  LocationField: ({
    onChange,
  }: {
    onChange: (value: { label: string; lat: number; lon: number }) => void;
  }) => (
    <button type="button" onClick={() => onChange({ label: 'Austin', lat: 30.27, lon: -97.74 })}>
      Pick Austin
    </button>
  ),
}));

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');

  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      me: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    },
  };
});

const proUser: User = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  city: null,
  role: 'user',
  is_pro: true,
  interests: [],
};

describe('ProSetupPage', () => {
  afterEach(() => {
    cleanup();
    clearAuthToken();
  });

  it('requires a city and at least one interest, including a custom one', async () => {
    setAuthToken('test-token');
    vi.mocked(authApi.me).mockResolvedValue({
      data: { user: proUser },
      message: 'User retrieved successfully.',
    });
    vi.mocked(authApi.updateProfile).mockResolvedValue({
      data: { user: { ...proUser, city: 'Austin', interests: ['Pottery'] }, weekend_delivery: 'sent' },
      message: 'Profile updated successfully.',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProSetupPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    await screen.findByRole('form', { name: /weekend preferences/i });
    expect(screen.getByText(/goes out on its own/i)).toBeTruthy();
    expect(authApi.updateProfile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Pick Austin' }));
    fireEvent.change(screen.getByPlaceholderText('Add your own…'), { target: { value: 'Pottery' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(
      () => {
        expect(authApi.updateProfile).toHaveBeenCalledWith({
          city: 'Austin',
          interests: ['Pottery'],
        });
      },
      { timeout: 3000 },
    );
  });
});
