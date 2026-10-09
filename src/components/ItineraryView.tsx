import { useId, useState } from 'react';
import type { EventCredit, ItineraryContent, ItineraryDay, ItineraryStop } from '../lib/apiTypes';
import { dayTabLabels } from '../lib/itineraryDays';
import { splitItineraryPreview } from '../lib/itineraryPreview';
import { Clock, ExternalLink, MapPin } from 'lucide-react';

import './ItineraryView.css';

type ItineraryViewProps = {
  content: ItineraryContent;
  planType?: string;
  fadeAfterStopCount?: number;
  roadTripSummary?: {
    gas?: number;
    food?: number;
    driveTime?: string;
  };
  eventCredits?: EventCredit[];
};

function StopLinks({ stop }: { stop: ItineraryStop }) {
  const links = [
    stop.venue_url ? { href: stop.venue_url, label: 'Open venue' } : null,
    stop.maps_url ? { href: stop.maps_url, label: 'Directions' } : null,
    stop.external_url && stop.external_url !== stop.venue_url
      ? { href: stop.external_url, label: 'More info' }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="itinerary-view__links">
      {links.map((link) => (
        <a
          key={`${link.label}-${link.href}`}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="itinerary-view__link"
        >
          {link.label === 'Directions' ? <MapPin size={14} /> : <ExternalLink size={14} />}
          {link.label}
        </a>
      ))}
    </div>
  );
}

function StopPhoto({ stop }: { stop: ItineraryStop }) {
  const [hasFailed, setHasFailed] = useState(false);

  if (!stop.photo_url || hasFailed) {
    return null;
  }

  return (
    <div className="itinerary-view__photo-frame">
      <img
        className="itinerary-view__photo"
        src={stop.photo_url}
        alt={stop.name}
        onError={() => setHasFailed(true)}
      />
    </div>
  );
}

function StopRow({
  stop,
  isLast,
}: {
  stop: ItineraryStop;
  isLast: boolean;
}) {
  return (
    <div className="itinerary-view__timeline-row">
      <div className="itinerary-view__rail">
        <span className="itinerary-view__dot" />
        {!isLast ? <span className="itinerary-view__line" /> : null}
      </div>
      <article className="itinerary-view__stop">
        <StopPhoto stop={stop} />
        <p className="itinerary-view__stop-time">
          <Clock size={14} />
          {stop.time}
        </p>
        <h3 className="itinerary-view__stop-name">{stop.name}</h3>
        {stop.address ? <p className="itinerary-view__stop-hours">{stop.address}</p> : null}
        {stop.hours ? <p className="itinerary-view__stop-hours">{stop.hours}</p> : null}
        <p className="itinerary-view__stop-activity">{stop.activity}</p>
        {stop.cost_per_person != null && stop.cost_per_person > 0 ? (
          <p className="itinerary-view__stop-cost">
            ${Math.round(stop.cost_per_person)} per person · Estimate
          </p>
        ) : null}
        {stop.notes ? <p className="itinerary-view__stop-notes">{stop.notes}</p> : null}
        <StopLinks stop={stop} />
      </article>
    </div>
  );
}

function renderStops(stops: ItineraryContent['stops']) {
  return (stops ?? []).map((stop, index) => (
    <StopRow key={`${stop.time}-${stop.name}-${index}`} stop={stop} isLast={index === (stops?.length ?? 0) - 1} />
  ));
}

function EventCredits({ credits }: { credits?: EventCredit[] }) {
  const visible = (credits ?? []).filter((credit) => credit.url && credit.label);

  if (visible.length === 0) {
    return null;
  }

  return (
    <p className="itinerary-view__credit">
      {visible.map((credit) => (
        <a key={credit.source} href={credit.url} target="_blank" rel="noreferrer">
          {credit.label}
        </a>
      ))}
    </p>
  );
}

function DayBlock({ day }: { day: ItineraryDay }) {
  return (
    <div className="itinerary-view__day">
      {day.date ? <h3>{day.date}</h3> : null}
      {day.theme ? <p className="itinerary-view__day-theme">{day.theme}</p> : null}
      {renderStops(day.stops)}
    </div>
  );
}

function DayTabs({ days }: { days: ItineraryDay[] }) {
  const baseId = useId();
  const [selected, setSelected] = useState(0);
  const labels = dayTabLabels(days.map((day) => day.date));
  const index = selected < days.length ? selected : 0;
  const day = days[index];

  return (
    <div className="itinerary-view__days">
      <div className="itinerary-view__day-tabs" role="tablist" aria-label="Days">
        {labels.map((label, tabIndex) => (
          <button
            key={`${label}-${tabIndex}`}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tabIndex}`}
            aria-selected={tabIndex === index}
            aria-controls={`${baseId}-panel`}
            className={`itinerary-view__day-tab${tabIndex === index ? ' is-active' : ''}`}
            onClick={() => setSelected(tabIndex)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${index}`}
      >
        {day ? <DayBlock day={day} /> : null}
      </div>
    </div>
  );
}

function ItineraryStops({ content }: { content: ItineraryContent }) {
  const days = content.days ?? [];

  if (days.length > 1) {
    return <DayTabs days={days} />;
  }

  if (days.length === 1) {
    return <DayBlock day={days[0]} />;
  }

  return <>{renderStops(content.stops ?? [])}</>;
}

export function ItineraryView({
  content,
  planType,
  fadeAfterStopCount,
  roadTripSummary,
  eventCredits,
}: ItineraryViewProps) {
  const showRoadTripStrip =
    planType === 'road_trip' &&
    (roadTripSummary?.gas != null || roadTripSummary?.food != null || roadTripSummary?.driveTime);
  const parts = fadeAfterStopCount == null ? null : splitItineraryPreview(content, fadeAfterStopCount);
  const visible = parts?.clear ?? content;
  const faded = parts?.faded ?? null;

  return (
    <section className="itinerary-view">
      <h2 className="itinerary-view__title">{content.title}</h2>
      {content.summary ? <p className="itinerary-view__summary">{content.summary}</p> : null}
      <p className="itinerary-view__disclaimer">
        Times are ranges, not exact times. Places and plans can be off. Double-check before you go.
      </p>

      {showRoadTripStrip ? (
        <div className="itinerary-view__strip">
          {roadTripSummary?.gas != null ? (
            <span className="itinerary-view__chip">Gas ~${roadTripSummary.gas}</span>
          ) : null}
          {roadTripSummary?.food != null ? (
            <span className="itinerary-view__chip">Food ~${roadTripSummary.food}</span>
          ) : null}
          {roadTripSummary?.driveTime ? (
            <span className="itinerary-view__chip">{roadTripSummary.driveTime}</span>
          ) : null}
        </div>
      ) : null}

      <ItineraryStops content={visible} />
      {faded ? (
        <div className="itinerary-view__locked" aria-hidden="true">
          <ItineraryStops content={faded} />
        </div>
      ) : null}
      <EventCredits credits={eventCredits} />
    </section>
  );
}
