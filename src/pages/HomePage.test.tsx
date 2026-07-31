import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders landing sections and plan links', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: /plan unforgettable outings/i })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /what are you planning/i })).toBeTruthy();

    expect(screen.getByRole('link', { name: /plan my date night/i })).toHaveAttribute('href', '/plan/date_night');
    expect(screen.getByRole('link', { name: /plan my night out/i })).toHaveAttribute('href', '/plan/night_out');
    expect(screen.getByRole('link', { name: /plan my vacation/i })).toHaveAttribute('href', '/plan/vacation');
    expect(screen.getByRole('link', { name: /plan my road trip/i })).toHaveAttribute('href', '/plan/road_trip');
  });
});
