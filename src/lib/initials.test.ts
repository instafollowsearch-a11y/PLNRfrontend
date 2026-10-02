import { describe, expect, it } from 'vitest';

import { getInitials } from './initials';

describe('getInitials', () => {
  it('uses the first letter of the first two words', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
  });

  it('uses one letter for a single name', () => {
    expect(getInitials('Ada')).toBe('A');
  });

  it('returns nothing for a blank name', () => {
    expect(getInitials('   ')).toBe('');
  });
});
