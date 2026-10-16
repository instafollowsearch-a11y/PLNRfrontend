import { describe, expect, it } from 'vitest';

import { dayTabLabels, withRoadTripDays } from './itineraryDays';

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

  it('splits a multi-day road trip into dated days', () => {
    const plan = withRoadTripDays(
      {
        title: 'Austin to Dallas',
        summary: 'On the road',
        stops: [
          { time: '8:00 AM', name: 'Depart', activity: 'Drive', notes: '' },
          { time: '1:00 PM', name: 'Lunch', activity: 'Eat', notes: '' },
          { time: '9:00 AM', name: 'Viewpoint', activity: 'Stop', notes: '' },
        ],
      },
      '2026-10-08',
      '2026-10-09',
    );

    expect(plan.days?.map((day) => day.date)).toEqual([
      'Thursday, October 8, 2026',
      'Friday, October 9, 2026',
    ]);
    expect(plan.days?.[1].stops[0].name).toBe('Viewpoint');
    expect(plan.stops).toBeUndefined();
  });
});
