import { describe, expect, it } from 'vitest';

import { dayTabLabels } from './itineraryDays';

describe('dayTabLabels', () => {
  it('reads a calendar date as that local weekday', () => {
    expect(dayTabLabels(['2025-08-20', '2025-08-21'])).toEqual(['Wednesday', 'Thursday']);
  });

  it('uses the weekday when each day is different', () => {
    expect(dayTabLabels(['Wednesday, June 10, 2026', 'Thursday, June 11, 2026'])).toEqual([
      'Wednesday',
      'Thursday',
    ]);
  });

  it('keeps the date when the same weekday appears twice', () => {
    expect(dayTabLabels(['Monday, June 1, 2026', 'Monday, June 8, 2026'])).toEqual([
      'Monday, Jun 1',
      'Monday, Jun 8',
    ]);
  });

  it('keeps a label that is not a date', () => {
    expect(dayTabLabels(['Arrive', ''])).toEqual(['Arrive', 'Day 2']);
  });
});
