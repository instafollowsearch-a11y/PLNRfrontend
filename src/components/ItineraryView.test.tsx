import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ItineraryView } from './ItineraryView';

describe('ItineraryView', () => {
  it('renders venue and maps links when present', () => {
    render(
      <ItineraryView
        content={{
          title: 'Night Out',
          summary: 'A fun evening',
          stops: [
            {
              time: '8:00 PM',
              name: 'Jazz Club',
              activity: 'Live music',
              notes: 'Arrive early',
              venue_url: 'https://example.com/jazz',
              maps_url: 'https://maps.example.com/jazz',
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('link', { name: /open venue/i })).toHaveAttribute(
      'href',
      'https://example.com/jazz',
    );
    expect(screen.getByRole('link', { name: /directions/i })).toHaveAttribute(
      'href',
      'https://maps.example.com/jazz',
    );
  });
});
