import { describe, expect, it } from 'vitest';

import type { SuggestionPayload } from './apiTypes';
import {
  chipsForSuggestion,
  priceLabelForSuggestion,
  shortenHook,
  summarizeSuggestionCard,
} from './suggestionCardSummary';

const base: SuggestionPayload = {
  name: 'Grocery Store Cooking Challenge & Backyard Picnic',
  description:
    'Grab ingredients at Brookshire’s for about $38, cook together at home, then picnic under the October night sky with leftovers and lemonade.',
  estimated_cost: 38,
  time_slot: '7:44 PM – 10:00 PM',
  venues: ['Brookshire’s Grocery, Texarkana', 'Miller County Park', 'Extra Venue'],
};

describe('suggestionCardSummary', () => {
  it('keeps a short description unchanged', () => {
    expect(shortenHook('A quiet evening out.')).toBe('A quiet evening out.');
  });

  it('truncates a long first sentence', () => {
    const long =
      'This is a very long opening sentence that keeps going with lots of detail about every stop and every budget line so the card stays scannable for busy people.';
    const hook = shortenHook(long);
    expect(hook.endsWith('…')).toBe(true);
    expect(hook.length).toBeLessThanOrEqual(110);
  });

  it('formats price by plan type', () => {
    expect(priceLabelForSuggestion({ ...base, estimated_cost_per_person: 22 }, 'night_out')).toBe(
      '$22 / person',
    );
    expect(priceLabelForSuggestion(base, 'date_night')).toBe('$38 total');
    expect(
      priceLabelForSuggestion({ ...base, estimated_cost_total: 420 }, 'vacation'),
    ).toBe('$420 trip');
    expect(
      priceLabelForSuggestion(
        { ...base, estimated_gas_cost: 18, estimated_food_cost: 14 },
        'road_trip',
      ),
    ).toBe('$32 total');
  });

  it('builds chips without dumping every venue', () => {
    const chips = chipsForSuggestion(base, 'date_night');
    const labels = chips.map((chip) => chip.label);
    expect(labels).toContain('7:44 PM – 10:00 PM');
    expect(labels).toContain('Brookshire’s Grocery, Texarkana');
    expect(labels).toContain('Miller County Park');
    expect(labels).not.toContain('Extra Venue');
    expect(chips[0]?.kind).toBe('time');
    expect(chips.length).toBeLessThanOrEqual(4);
  });

  it('adds road-trip stop count when venues are empty', () => {
    const chips = chipsForSuggestion(
      {
        name: 'Loop',
        description: 'Drive.',
        total_drive_time: '2h 10m',
        stops: [{ name: 'Paint Rock' }, { name: 'Eden' }, { name: 'Concho' }],
      },
      'road_trip',
    );
    const labels = chips.map((chip) => chip.label);
    expect(labels).toContain('2h 10m');
    expect(labels).toContain('3 stops');
    expect(labels).toContain('Paint Rock');
    expect(labels).toContain('Eden');
    expect(chips.find((chip) => chip.label === '3 stops')?.kind).toBe('stops');
  });

  it('summarizes a compact card payload', () => {
    const summary = summarizeSuggestionCard(base, 'date_night');
    expect(summary.title).toContain('Grocery Store');
    expect(summary.eyebrow).toBe('Date night');
    expect(summary.hook.length).toBeLessThan(base.description.length);
    expect(summary.priceAmount).toBe('$38');
    expect(summary.priceSuffix).toBe('total');
    expect(summary.priceLabel).toBe('$38 total');
    expect(summary.chips.length).toBeGreaterThan(0);
  });

  it('handles missing payload safely', () => {
    expect(summarizeSuggestionCard(null, 'date_night')).toEqual({
      title: '',
      hook: '',
      eyebrow: 'Date night',
      priceAmount: null,
      priceSuffix: null,
      priceLabel: null,
      chips: [],
    });
  });
});
