import { describe, expect, it } from 'vitest';

import { previewItinerary } from './itineraryPreview';

describe('previewItinerary', () => {
  it('keeps the title, summary, and first stop', () => {
    const preview = previewItinerary({
      title: 'Austin night',
      summary: 'Music and tacos',
      stops: [
        { time: '8:00 PM', name: 'Jazz Club', activity: 'Listen', notes: 'First' },
        { time: '10:00 PM', name: 'Tacos', activity: 'Eat', notes: 'Second' },
      ],
    });

    expect(preview.stops?.map((stop) => stop.name)).toEqual(['Jazz Club']);
    expect(preview.title).toBe('Austin night');
    expect(preview.summary).toBe('Music and tacos');
  });

  it('keeps only the first stop of the first day', () => {
    const preview = previewItinerary({
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

    expect(preview.days).toHaveLength(1);
    expect(preview.days?.[0].stops.map((stop) => stop.name)).toEqual(['Hotel']);
  });
});