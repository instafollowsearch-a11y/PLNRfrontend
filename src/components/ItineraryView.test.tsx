import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ItineraryView } from './ItineraryView';

describe('ItineraryView', () => {
  afterEach(() => {
    cleanup();
  });

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
    expect(
      screen.getByText(
        'Times are ranges, not exact times. Places and plans can be off. Double-check before you go.',
      ),
    ).toBeInTheDocument();
  });

  it('shows a listing photo and the hours line when the stop has them', () => {
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
              notes: '',
              photo_url: 'https://example.com/api/v1/place-photos/abc',
              hours: 'Friday: 5 PM–12 AM',
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('img', { name: 'Jazz Club' })).toHaveAttribute(
      'src',
      'https://example.com/api/v1/place-photos/abc',
    );
    expect(screen.getByText('Friday: 5 PM–12 AM')).toBeInTheDocument();
  });

  it('keeps a text row when the stop has no photo', () => {
    render(
      <ItineraryView
        content={{
          title: 'Night Out',
          summary: 'A fun evening',
          stops: [
            {
              time: '9:00 PM',
              name: 'Quiet Bar',
              activity: 'A drink',
              notes: '',
            },
          ],
        }}
      />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quiet Bar' })).toBeInTheDocument();
    expect(screen.queryByText(/friday:/i)).not.toBeInTheDocument();
  });

  it('opens the venue without a Find Local label', () => {
    render(
      <ItineraryView
        content={{
          title: 'Night Out',
          summary: 'A fun evening',
          stops: [
            {
              time: '9:00 PM',
              name: 'Sarah Sharp Quintet',
              activity: 'Live jazz',
              notes: '',
              findlocal_url: 'https://findlocal.community/event/11111111-1111-1111-1111-111111111111',
              venue_url: 'https://example.com/elephant-room',
            },
          ],
        }}
      />,
    );

    expect(screen.queryByRole('link', { name: 'View on Find Local' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open venue/i })).toHaveAttribute(
      'href',
      'https://example.com/elephant-room',
    );
  });

  it('shows one day at a time when the plan spans several days', () => {
    render(
      <ItineraryView
        content={{
          title: 'Barcelona',
          summary: 'A week away',
          days: [
            {
              date: 'Wednesday, June 10, 2026',
              theme: 'Arrive',
              stops: [{ time: '10:00 AM', name: 'Market', activity: 'Browse', notes: '' }],
            },
            {
              date: 'Thursday, June 11, 2026',
              theme: 'Walk',
              stops: [{ time: '11:00 AM', name: 'Park', activity: 'Sit', notes: '' }],
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Wednesday', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Market' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Park' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Thursday' }));

    expect(screen.getByRole('heading', { name: 'Park' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Market' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).toBeInTheDocument();
  });

  it('keeps a single day as one list', () => {
    render(
      <ItineraryView
        content={{
          title: 'Night Out',
          summary: 'One evening',
          stops: [{ time: '8:00 PM', name: 'Jazz Club', activity: 'Live music', notes: '' }],
        }}
      />,
    );

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Jazz Club' })).toBeInTheDocument();
  });
});
