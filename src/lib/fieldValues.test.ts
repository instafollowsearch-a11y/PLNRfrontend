import { describe, expect, it } from 'vitest';

import {
  formatDisplayDate,
  formatDisplayTime,
  serializeAnswerForApi,
} from './fieldValues';

describe('fieldValues', () => {
  it('formats display date', () => {
    expect(formatDisplayDate('2026-06-14')).toMatch(/June 14/);
  });

  it('formats display time', () => {
    expect(formatDisplayTime('20:00')).toMatch(/8:00/);
  });

  it('serializes date range for API', () => {
    const result = serializeAnswerForApi(
      { key: 'dates', label: 'Dates', type: 'date_range' },
      JSON.stringify({ start: '2026-06-10', end: '2026-06-17' }),
    );

    expect(result).toContain('June 10');
    expect(result).toContain('June 17');
  });

  it('serializes location for API', () => {
    const result = serializeAnswerForApi(
      { key: 'city', label: 'City', type: 'location' },
      JSON.stringify({ label: 'Austin, Texas', lat: 30.27, lon: -97.74 }),
    );

    expect(result).toBe('Austin, Texas');
  });

  it('keeps coordinates for the chosen area', () => {
    const result = serializeAnswerForApi(
      { key: 'area_center', label: 'Which area?', type: 'location' },
      JSON.stringify({ label: 'East Austin', lat: 30.26, lon: -97.74 }),
    );

    expect(JSON.parse(result)).toEqual({ label: 'East Austin', lat: 30.26, lon: -97.74 });
  });
});
