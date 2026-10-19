import { describe, expect, it } from 'vitest';

import { normalizeEmail } from './email';

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Ada@Plnr.Test ')).toBe('ada@plnr.test');
  });

  it('does not throw on empty or missing values', () => {
    expect(normalizeEmail('')).toBe('');
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail(undefined)).toBe('');
  });
});
