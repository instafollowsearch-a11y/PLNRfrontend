import { describe, expect, it } from 'vitest';

import { CONFIRM_SUBTITLES, getConfirmSubtitle } from './confirmCopy';

describe('confirmCopy', () => {
  it('returns plan-type specific generate copy', () => {
    expect(getConfirmSubtitle('night_out')).toBe('Generate your perfect night out.');
    expect(getConfirmSubtitle('date_night')).toBe('Generate your perfect date night.');
    expect(getConfirmSubtitle('vacation')).toBe('Generate your perfect vacation.');
    expect(getConfirmSubtitle('road_trip')).toBe('Generate your perfect road trip.');
    expect(Object.keys(CONFIRM_SUBTITLES)).toHaveLength(4);
  });
});
