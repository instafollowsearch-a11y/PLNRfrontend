import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { WeekendRecommendationItem } from '../../lib/apiTypes';
import { WeekendPicksResults } from './WeekendPicksResults';

const weekendItems: WeekendRecommendationItem[] = [
  {
    event_id: 1,
    title: 'Friday Jazz',
    venue: 'Elephant Room',
    starts_at: '2026-10-02T19:00:00-05:00',
    day: 'Friday',
    url: null,
    reason: 'Live jazz',
  },
  {
    event_id: 2,
    title: 'Saturday Market',
    venue: 'Downtown',
    starts_at: '2026-10-03T11:00:00-05:00',
    day: 'Saturday',
    url: null,
    reason: 'Food',
  },
  {
    event_id: 3,
    title: 'Sunday Walk',
    venue: 'Lady Bird Lake',
    starts_at: '2026-10-04T10:00:00-05:00',
    day: 'Sunday',
    url: null,
    reason: 'Outdoors',
  },
];

describe('WeekendPicksResults', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows Friday, Saturday, Sunday, and the Saturday plan', () => {
    render(
      <WeekendPicksResults
        items={weekendItems}
        saturdayPlan={{
          title: 'Saturday in Austin',
          summary: 'A Saturday in Austin with 1 stop, starting with Saturday Market.',
          stops: [{ time: '11:00 AM', name: 'Saturday Market', detail: 'Downtown' }],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Friday' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Saturday' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Sunday' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Saturday plan' })).toBeTruthy();
    expect(screen.getByText('Saturday in Austin')).toBeTruthy();
  });

  it('keeps an older list flat when the items have no weekend day', () => {
    render(
      <WeekendPicksResults
        items={[
          {
            event_id: 9,
            title: 'Midweek Show',
            venue: 'Hole in the Wall',
            starts_at: '2026-09-30T20:00:00-05:00',
            url: null,
            reason: 'Saved earlier',
          },
        ]}
      />,
    );

    expect(screen.getByText('Midweek Show')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Friday' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Saturday plan' })).toBeNull();
  });
});
