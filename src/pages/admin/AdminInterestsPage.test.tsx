import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../../contexts/AuthContext';
import { accountApi, authApi } from '../../lib/api';
import { clearAuthToken } from '../../lib/authStorage';
import { AdminInterestsPage } from './AdminInterestsPage';

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
      listInterestAccounts: vi.fn(),
      runInterestScan: vi.fn(),
    },
  };
});

const emptyMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

const emptySummary = {
  accounts: 0,
  with_saved_interests: 0,
  ready: 0,
  matched: 0,
  unmatched: 0,
  skipped: 0,
  top_interests: [],
};

describe('AdminInterestsPage', () => {
  afterEach(() => {
    cleanup();
    clearAuthToken();
    vi.mocked(authApi.me).mockReset();
    vi.mocked(authApi.me).mockRejectedValue(new Error('no session'));
  });

  it('shows an empty state before any accounts', async () => {
    vi.mocked(accountApi.listInterestAccounts).mockResolvedValue({
      data: { accounts: [], summary: emptySummary, scan: null, meta: emptyMeta },
      message: 'Interest accounts retrieved.',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminInterestsPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'No accounts yet' })).toBeTruthy();
    expect(within(screen.getByRole('main')).getByRole('heading', { level: 1, name: 'Interests' })).toBeTruthy();
    expect(screen.getByText(/no scan yet/i)).toBeTruthy();
    expect(screen.getByText('Saved interests')).toBeTruthy();
    expect(screen.getByText(/nothing coming up in their city fit/i)).toBeTruthy();
    expect(screen.getByText(/missing a city, saved interests, or both/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Scan now' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Not ready' })).toBeTruthy();
  });

  it('shows saved interests, a plan mention, and a match', async () => {
    vi.mocked(accountApi.listInterestAccounts).mockResolvedValue({
      data: {
        scan: {
          id: 1,
          started_at: '2026-10-10T07:15:00Z',
          finished_at: '2026-10-10T07:15:05Z',
          users_checked: 2,
          matches_kept: 1,
          users_skipped: 1,
        },
        summary: {
          accounts: 2,
          with_saved_interests: 1,
          ready: 1,
          matched: 1,
          unmatched: 0,
          skipped: 1,
          top_interests: [{ label: 'jazz', accounts: 1 }],
        },
        accounts: [
          {
            id: 8,
            name: 'Ada Lovelace',
            email: 'ada@plnr.test',
            city: 'Austin',
            is_pro: true,
            role: 'user',
            saved_interests: ['jazz'],
            plan_interests: [
              {
                label: 'Live jazz',
                city: 'Austin',
                plan_type: 'Night out',
                created_at: '2026-10-09T18:00:00Z',
              },
            ],
            weekend_interests: [],
            status: 'matched',
            skip_reason: null,
            matches: [
              {
                id: 4,
                matched_interest: 'jazz',
                score: 1,
                event: {
                  id: 12,
                  title: 'Jazz at the Continental',
                  city: 'Austin',
                  starts_at: '2026-10-11T02:00:00Z',
                  url: 'https://events.example/jazz',
                },
              },
            ],
          },
        ],
        meta: { ...emptyMeta, total: 1 },
      },
      message: 'Interest accounts retrieved.',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminInterestsPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeTruthy();
    expect(screen.getByText('ada@plnr.test')).toBeTruthy();
    expect(screen.getAllByText('jazz').length).toBeGreaterThan(0);
    expect(screen.getByText('Live jazz')).toBeTruthy();
    expect(screen.getAllByText(/from a plan/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/the scan uses these/i)).toBeTruthy();
    expect(screen.getByText(/not used in the scan/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Jazz at the Continental' })).toHaveAttribute(
      'href',
      'https://events.example/jazz',
    );
    expect(screen.getByText(/checked 2 accounts/i)).toBeTruthy();
  });
});
