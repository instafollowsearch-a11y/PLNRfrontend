import { describe, expect, it } from 'vitest';

import { androidPlanIntentUrl, shouldOpenPlanInApp } from './openPlanInApp';

describe('openPlanInApp', () => {
  it('opens the installed Android app and falls back to the same page', () => {
    const url = androidPlanIntentUrl(
      'night_out',
      'f90b55f0-8164-4290-af71-0774fc9b19c4',
      'https://myplnr.app/plan/night_out/itinerary?session=f90b55f0-8164-4290-af71-0774fc9b19c4',
    );

    expect(url.startsWith('intent://plan/night_out/itinerary?session=')).toBe(true);
    expect(url).toContain('scheme=plnr');
    expect(url).toContain('package=com.plnr.app');
    expect(decodeURIComponent(url)).toContain('web=1');
  });

  it('leaves a computer browser on the website', () => {
    expect(shouldOpenPlanInApp('Mozilla/5.0 (Macintosh)', false)).toBe(false);
    expect(shouldOpenPlanInApp('Mozilla/5.0 (Linux; Android 14)', false)).toBe(true);
    expect(shouldOpenPlanInApp('Mozilla/5.0 (Linux; Android 14)', true)).toBe(false);
  });
});
