import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LandingHero } from './LandingHero';

describe('LandingHero', () => {
  it('renders headline and primary CTA', () => {
    render(<LandingHero onStartPlanning={vi.fn()} onHowItWorks={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: /plan unforgettable outings/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /start planning free/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /see how it works/i })).toBeTruthy();
  });
});
