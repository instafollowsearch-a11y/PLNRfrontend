import { describe, expect, it } from 'vitest';

import {
  buildLivePlan,
  liveDayIndex,
  nextPlayInstant,
  parseCalendarDate,
  pulsePeriodMs,
  resolveTripDate,
  timezoneFromCoordinates,
} from './livePlan';

const ZONE = 'America/Chicago';
const NIGHT = '2026-10-17';

const STOPS = [
  { time: '6:00 – 7:30 PM', name: 'Saltgrass Steak House', notes: '' },
  { time: '8:00 – 9:15 PM', name: 'Texas Roadhouse', notes: '' },
  { time: '9:45 – 10:45 PM', name: 'Lone Star Steakhouse', notes: '' },
  { time: '11:00 PM – 12:05 AM', name: 'Local Outdoor or Patio Spot', notes: '' },
  { time: '12:15 – 1:30 AM', name: "Group's Choice Hangout", notes: '' },
];

function at(iso: string) {
  return buildLivePlan({
    stops: STOPS,
    date: NIGHT,
    timeZone: ZONE,
    now: new Date(iso),
  });
}

describe('live plan status', () => {
  it('marks the first stop as arriving when it is under five minutes away', () => {
    const live = at('2026-10-17T22:57:00Z');

    expect(live?.clockLabel).toBe('5:57 PM');
    expect(live?.banner.eyebrow).toBe('FIRST STOP');
    expect(live?.banner.name).toBe('Saltgrass Steak House');
    expect(live?.banner.subtitle).toBe('First stop of the night');
    expect(live?.banner.doneLabel).toBe('0 of 5 done');
    expect(live?.banner.primary).toBe('Arriving');
    expect(live?.banner.secondary).toBe('Starts 6:00 PM');
    expect(live?.stops.map((stop) => stop.status)).toEqual(['next', 'later', 'later', 'later', 'later']);
    expect(live?.stops[0].chip).toBe('Arriving');
    expect(live?.stops[0].pulseMs).toBe(750);
  });

  it('keeps one next stop while you are still at the current one', () => {
    const live = at('2026-10-18T04:36:00Z');

    expect(live?.clockLabel).toBe('11:36 PM');
    expect(live?.banner.eyebrow).toBe('NEXT STOP');
    expect(live?.banner.name).toBe("Group's Choice Hangout");
    expect(live?.banner.subtitle).toBe("You're at Local Outdoor or Patio Spot until 12:05 AM");
    expect(live?.banner.doneLabel).toBe('3 of 5 done');
    expect(live?.banner.primary).toBe('39 min');
    expect(live?.stops.map((stop) => stop.chip)).toEqual([
      'Done',
      'Done',
      'Done',
      "You're here",
      'Next · in 39 min',
    ]);
    expect(live?.stops[4].pulseMs).toBe(1800);
  });

  it('names the last stop once you are inside it', () => {
    const live = at('2026-10-18T06:13:00Z');

    expect(live?.banner.eyebrow).toBe('LAST STOP');
    expect(live?.banner.primary).toBe('Now');
    expect(live?.banner.secondary).toBe('Until 1:30 AM');
    expect(live?.banner.subtitle).toBe('Last stop of the night');
    expect(live?.banner.doneLabel).toBe('4 of 5 done');
    expect(live?.stops[4].status).toBe('here');
    expect(live?.stops[4].pulseMs).toBeNull();
  });

  it('keeps a stop after midnight on the same night', () => {
    const live = at('2026-10-18T05:20:00Z');

    expect(live?.clockLabel).toBe('12:20 AM');
    expect(live?.stops[3].status).toBe('done');
    expect(live?.stops[4].status).toBe('here');
    expect(live?.stops[4].windowLabel).toMatch(/12:15/);
    expect(live?.stops[4].windowLabel).toMatch(/1:30/);
  });

  it('uses the next start when a stop only has one clock time', () => {
    const live = buildLivePlan({
      stops: [
        { time: '8:00 PM', name: 'Jazz', notes: '' },
        { time: '10:00 PM', name: 'Bar', notes: '45 min' },
      ],
      date: NIGHT,
      timeZone: ZONE,
      now: new Date('2026-10-17T22:00:00Z'),
    });

    expect(live?.stops[0].windowLabel).toMatch(/8:00/);
    expect(live?.stops[0].windowLabel).toMatch(/10:00/);
    expect(live?.stops[1].windowLabel).toMatch(/10:45/);
  });

  it('says you are heading over once a stop has ended', () => {
    const live = at('2026-10-18T00:40:00Z');

    expect(live?.banner.eyebrow).toBe('NEXT STOP');
    expect(live?.banner.name).toBe('Texas Roadhouse');
    expect(live?.banner.subtitle).toBe('Heading over from Saltgrass Steak House');
    expect(live?.stops[0].status).toBe('done');
    expect(live?.stops[0].lineFill).toBeGreaterThan(0.8);
    expect(live?.stops[0].lineFill).toBeLessThan(1);
    expect(live?.stops[1].status).toBe('next');
  });

  it('drops the pulse when reduce motion is on', () => {
    const live = buildLivePlan({
      stops: STOPS,
      date: NIGHT,
      timeZone: ZONE,
      now: new Date('2026-10-17T22:57:00Z'),
      reduceMotion: true,
    });

    expect(live?.stops[0].pulseMs).toBeNull();
    expect(live?.stops[0].chip).toBe('Arriving');
  });

  it('speeds the pulse up as the stop gets closer', () => {
    expect(pulsePeriodMs(30, false)).toBe(1800);
    expect(pulsePeriodMs(10, false)).toBe(1200);
    expect(pulsePeriodMs(9, false)).toBe(750);
    expect(pulsePeriodMs(4, true)).toBeNull();
  });

  it('reads a trip date from a day label or a night-out date', () => {
    const now = new Date('2026-10-17T22:00:00Z');

    expect(parseCalendarDate('Wednesday, June 10, 2026', ZONE, now)).toBe('2026-06-10');
    expect(parseCalendarDate('2026-10-17', ZONE, now)).toBe('2026-10-17');
    expect(resolveTripDate(['Saturday, October 17, 6:00 PM – 10:00 PM'], ZONE, now)).toBe('2026-10-17');
    expect(resolveTripDate([null, 'not a date'], ZONE, now)).toBe('2026-10-17');
  });

  it('slows the preview near a stop and stops after the night ends', () => {
    const live = at('2026-10-17T22:57:00Z');

    expect(live).not.toBeNull();
    expect(nextPlayInstant(new Date('2026-10-17T22:57:00Z'), live!)?.getTime()).toBe(
      new Date('2026-10-17T22:57:15Z').getTime(),
    );

    const between = at('2026-10-18T00:40:00Z');
    expect(nextPlayInstant(new Date('2026-10-18T00:40:00Z'), between!)?.getTime()).toBe(
      new Date('2026-10-18T00:45:00Z').getTime(),
    );
    expect(nextPlayInstant(new Date('2026-10-18T07:00:00Z'), live!)).toBeNull();
  });

  it('reads the trip zone from the city pin, not from a bad coordinate', () => {
    expect(timezoneFromCoordinates(30.2672, -97.7431)).toBe('America/Chicago');
    expect(timezoneFromCoordinates(Number.NaN, 0)).toBeNull();
  });

  it('opens the day that is live today instead of the first day', () => {
    const dates = ['Saturday, October 17, 2026', 'Sunday, October 18, 2026'];

    expect(liveDayIndex(dates, ZONE, new Date('2026-10-18T23:00:00Z'))).toBe(1);
    expect(liveDayIndex(dates, ZONE, new Date('2026-10-17T23:00:00Z'))).toBe(0);
  });

  it('leaves the plan alone when the time zone is missing', () => {
    expect(
      buildLivePlan({
        stops: STOPS,
        date: NIGHT,
        timeZone: 'Not/AZone',
        now: new Date('2026-10-17T22:57:00Z'),
      }),
    ).toBeNull();
  });
});
