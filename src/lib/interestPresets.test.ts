import { describe, expect, it } from 'vitest';

import {
  buildInterestString,
  DATE_NIGHT_INTEREST_PRESETS,
  encodeInterestValue,
  NIGHT_OUT_INTEREST_PRESETS,
  parseInterestValue,
  ROAD_TRIP_INTEREST_PRESETS,
  VACATION_INTEREST_PRESETS,
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

  it('puts Open to suggestions first on each interest list', () => {
    const lists = [
      DATE_NIGHT_INTEREST_PRESETS,
      NIGHT_OUT_INTEREST_PRESETS,
      VACATION_INTEREST_PRESETS,
      ROAD_TRIP_INTEREST_PRESETS,
    ];

    for (const list of lists) {
      expect(list[0]).toBe('Open to suggestions');
      expect(list.filter((preset) => preset === 'Open to suggestions')).toHaveLength(1);
    }
  });

  it('adds Club / nightlife beside Open to suggestions without replacing Nightlife', () => {
    const lists = [
      DATE_NIGHT_INTEREST_PRESETS,
      NIGHT_OUT_INTEREST_PRESETS,
      ROAD_TRIP_INTEREST_PRESETS,
    ];

    for (const list of lists) {
      expect(list[0]).toBe('Open to suggestions');
      expect(list[1]).toBe('Club / nightlife');
      expect(list.filter((preset) => preset === 'Club / nightlife')).toHaveLength(1);
    }

    expect(VACATION_INTEREST_PRESETS).toContain('Nightlife');
    expect(VACATION_INTEREST_PRESETS).not.toContain('Club / nightlife');
  });
});
