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
        'Hours of operation come from the place listing when we can match it. Double-check before you go.',
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
    expect(screen.getByText('Open Friday from 5 PM–12 AM')).toBeInTheDocument();
    expect(screen.queryByText('8:00 PM')).not.toBeInTheDocument();
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
    expect(screen.queryByText('Venue photo')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quiet Bar' })).toBeInTheDocument();
    expect(screen.queryByText('9:00 PM')).not.toBeInTheDocument();
    expect(screen.queryByText(/open /i)).not.toBeInTheDocument();
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

  it('opens the live day when today is later than the first day', () => {
    render(
      <ItineraryView
        timeZone="America/Chicago"
        now={new Date('2026-10-18T23:00:00Z')}
        content={{
          title: 'Weekend',
          summary: 'Two nights',
          days: [
            {
              date: 'Saturday, October 17, 2026',
              theme: 'Start',
              stops: [{ time: '8:00 PM', name: 'Saturday Stop', activity: 'Dinner', notes: '' }],
            },
            {
              date: 'Sunday, October 18, 2026',
              theme: 'Tonight',
              stops: [{ time: '7:00 PM', name: 'Sunday Stop', activity: 'Dinner', notes: '' }],
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Sunday', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sunday Stop' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Saturday Stop' })).not.toBeInTheDocument();
  });

  it('shows day tabs for a road trip that covers more than one day', () => {
    render(
      <ItineraryView
        planType="road_trip"
        tripDates={{ start: '2026-10-08', end: '2026-10-09' }}
        content={{
          title: 'Austin to Dallas',
          summary: 'Two days on the road',
          stops: [
            { time: '8:00 AM', name: 'Depart Austin', activity: 'Start', notes: '' },
            { time: '6:00 PM', name: 'Hotel', activity: 'Sleep', notes: '' },
            { time: '9:00 AM', name: 'Viewpoint', activity: 'Look', notes: '' },
          ],
        }}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Thursday', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Friday' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Depart Austin' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Viewpoint' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Friday' }));

    expect(screen.getByRole('heading', { name: 'Viewpoint' })).toBeInTheDocument();
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

  it('shows the live banner and next chip only when the trip zone is known', () => {
    render(
      <ItineraryView
        timeZone="America/Chicago"
        dateCandidates={['2026-10-17']}
        now={new Date('2026-10-17T22:57:00Z')}
        content={{
          title: 'Night Out',
          summary: 'A fun evening',
          stops: [
            { time: '6:00 – 7:30 PM', name: 'Saltgrass Steak House', activity: 'Dinner', notes: '' },
            { time: '8:00 – 9:15 PM', name: 'Texas Roadhouse', activity: 'Dinner', notes: '' },
          ],
        }}
      />,
    );

    expect(screen.getByText('FIRST STOP')).toBeInTheDocument();
    expect(screen.getAllByText('Arriving')).toHaveLength(2);
    expect(screen.getByText(/LIVE · 5:57 PM/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saltgrass Steak House' })).toBeInTheDocument();
    expect(screen.getByText('6:00 – 7:30 PM')).toBeInTheDocument();
  });

  it('keeps the guest preview free of the live banner', () => {
    render(
      <ItineraryView
        timeZone="America/Chicago"
        dateCandidates={['2026-10-17']}
        now={new Date('2026-10-17T22:57:00Z')}
        fadeAfterStopCount={1}
        content={{
          title: 'Night Out',
          summary: 'A fun evening',
          stops: [
            { time: '6:00 – 7:30 PM', name: 'Saltgrass Steak House', activity: 'Dinner', notes: '' },
            { time: '8:00 – 9:15 PM', name: 'Texas Roadhouse', activity: 'Dinner', notes: '' },
          ],
        }}
      />,
    );

    expect(screen.queryByText('FIRST STOP')).not.toBeInTheDocument();
    expect(screen.queryByText('Arriving')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saltgrass Steak House' })).toBeInTheDocument();
  });
});
