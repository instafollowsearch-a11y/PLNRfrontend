import { describe, expect, it } from 'vitest';

import {
  buildInterestString,
  DATE_NIGHT_INTEREST_PRESETS,
  encodeInterestValue,
  parseInterestValue,
} from './interestPresets';

describe('interestPresets', () => {
  it('builds comma-separated string for API', () => {
    const value = {
      selected: ['Wine bars', 'Live music'],
      custom: 'pottery class',
    };

    expect(buildInterestString(value)).toBe('Wine bars, Live music, pottery class');
  });

  it('round-trips encoded interest value', () => {
    const encoded = encodeInterestValue({
      selected: ['Art museums'],
      custom: 'sunset picnic',
    });

    const parsed = parseInterestValue(encoded, DATE_NIGHT_INTEREST_PRESETS);

    expect(parsed.selected).toEqual(['Art museums']);
    expect(parsed.custom).toBe('sunset picnic');
  });
});
