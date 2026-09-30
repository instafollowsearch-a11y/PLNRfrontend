import type { ItineraryContent, ItineraryStop } from '../lib/apiTypes';
import { Clock, ExternalLink, MapPin } from 'lucide-react';

import './ItineraryView.css';

type ItineraryViewProps = {
  content: ItineraryContent;
  planType?: string;
  roadTripSummary?: {
    gas?: number;
    food?: number;
    driveTime?: string;
  };
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
        <p className="itinerary-view__stop-time">
          <Clock size={14} />
          {stop.time}
        </p>
        <h3 className="itinerary-view__stop-name">{stop.name}</h3>
        <p className="itinerary-view__stop-activity">{stop.activity}</p>
        {stop.notes ? <p className="itinerary-view__stop-notes">{stop.notes}</p> : null}
        <StopLinks stop={stop} />
      </article>
    </div>
  );
}

function renderStops(stops: ItineraryContent['stops']) {
  return (stops ?? []).map((stop, index) => (
    <StopRow key={`${stop.time}-${index}`} stop={stop} isLast={index === (stops?.length ?? 0) - 1} />
  ));
}

export function ItineraryView({ content, planType, roadTripSummary }: ItineraryViewProps) {
  const showRoadTripStrip =
    planType === 'road_trip' &&
    (roadTripSummary?.gas != null || roadTripSummary?.food != null || roadTripSummary?.driveTime);

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

      {content.days?.length
        ? content.days.map((day, dayIndex) => (
            <div key={`${day.date}-${dayIndex}`} className="itinerary-view__day">
              <h3>{day.date}</h3>
              {day.theme ? <p className="itinerary-view__day-theme">{day.theme}</p> : null}
              {renderStops(day.stops)}
            </div>
          ))
        : renderStops(content.stops ?? [])}
    </section>
  );
}
