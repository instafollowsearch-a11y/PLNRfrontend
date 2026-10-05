import { describe, expect, it } from 'vitest';

import { splitItineraryPreview } from './itineraryPreview';

describe('splitItineraryPreview', () => {
  it('keeps the first two stops clear and returns the rest to fade', () => {
    const preview = splitItineraryPreview({
      title: 'Austin night',
      summary: 'Music and tacos',
      stops: [
        { time: '8:00 PM', name: 'Jazz Club', activity: 'Listen', notes: 'First' },
        { time: '9:00 PM', name: 'Tacos', activity: 'Eat', notes: 'Second' },
        { time: '11:00 PM', name: 'Rooftop', activity: 'Dance', notes: 'Third' },
      ],
    });

    expect(preview.clear.stops?.map((stop) => stop.name)).toEqual(['Jazz Club', 'Tacos']);
    expect(preview.faded?.stops?.map((stop) => stop.name)).toEqual(['Rooftop']);
    expect(preview.clear.title).toBe('Austin night');
    expect(preview.clear.summary).toBe('Music and tacos');
  });

  it('fades nothing when the plan has two stops or fewer', () => {
    const preview = splitItineraryPreview({
      title: 'Short night',
      summary: 'One stop',
      stops: [{ time: '8:00 PM', name: 'Jazz Club', activity: 'Listen', notes: '' }],
    });

    expect(preview.clear.stops?.map((stop) => stop.name)).toEqual(['Jazz Club']);
    expect(preview.faded).toBeNull();
  });

  it('keeps the first two stops across vacation days and fades the rest', () => {
    const preview = splitItineraryPreview({
      title: 'Barcelona',
      summary: 'A week',
      days: [
        {
          date: 'Day 1',
          theme: 'Arrive',
          stops: [
            { time: '10:00', name: 'Hotel', activity: 'Check in', notes: '' },
            { time: '13:00', name: 'Lunch', activity: 'Eat', notes: '' },
          ],
        },
        {
          date: 'Day 2',
          theme: 'Explore',
          stops: [{ time: '9:00', name: 'Park', activity: 'Walk', notes: '' }],
        },
      ],
    });

    expect(preview.clear.days?.[0].stops.map((stop) => stop.name)).toEqual(['Hotel', 'Lunch']);
    expect(preview.clear.days).toHaveLength(1);
    expect(preview.faded?.days?.map((day) => day.date)).toEqual(['Day 2']);
    expect(preview.faded?.days?.[0].stops.map((stop) => stop.name)).toEqual(['Park']);
  });
});
