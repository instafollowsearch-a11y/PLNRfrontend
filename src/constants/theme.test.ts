import { describe, expect, it } from 'vitest';

import { colors, planTypeAccents } from './theme';

describe('theme', () => {
  it('defines coral accent', () => {
    expect(colors.accent).toBe('#D4622A');
  });

  it('defines plan type accents', () => {
    expect(planTypeAccents.night_out).toBe('#D4622A');
    expect(planTypeAccents.date_night).toBe('#C45C8A');
  });
});
