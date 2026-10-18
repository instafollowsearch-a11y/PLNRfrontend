import { useEffect, useId, useMemo, useState } from 'react';
import type { EventCredit, ItineraryContent, ItineraryDay, ItineraryStop } from '../lib/apiTypes';
import { dayTabLabels, withRoadTripDays } from '../lib/itineraryDays';
import { splitItineraryPreview } from '../lib/itineraryPreview';
import {
  buildLivePlan,
  liveDayIndex,
  nextPlayInstant,
  resolveTripDate,
  type LiveStopView,
} from '../lib/livePlan';
import { openingHoursLabel } from '../lib/openingHours';
import { Check, Clock, ExternalLink, MapPin } from 'lucide-react';

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
  tripDates?: {
    start?: string | null;
    end?: string | null;
  };
  eventCredits?: EventCredit[];
  timeZone?: string | null;
  dateCandidates?: Array<string | null | undefined>;
  now?: Date;
};

type LiveTiming = {
  timeZone: string;
  now: Date;
  dateCandidates: Array<string | null | undefined>;
  reduceMotion: boolean;
};

function useTripClock(enabled: boolean): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 30_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled]);

  return now;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function useLiveNight(
  stops: ItineraryStop[],
  dateHint: string | null | undefined,
  timing: LiveTiming | null,
) {
  const [playNow, setPlayNow] = useState<Date | null>(null);
  const displayNow = playNow ?? timing?.now ?? new Date();
  const stopKey = stops.map((stop) => `${stop.time}|${stop.name}|${stop.notes ?? ''}`).join('\n');
  const candidateKey = (timing?.dateCandidates ?? []).join('|');

  const live = useMemo(() => {
    if (!timing) {
      return null;
    }

    return buildLivePlan({
      stops: stops.map((stop) => ({ time: stop.time, name: stop.name, notes: stop.notes })),
      date: resolveTripDate([dateHint, ...timing.dateCandidates], timing.timeZone, displayNow),
      timeZone: timing.timeZone,
      now: displayNow,
      reduceMotion: timing.reduceMotion,
    });
  }, [timing, dateHint, displayNow, stopKey, stops]);

  useEffect(() => {
    if (!playNow || !timing) {
      return undefined;
    }

    const id = window.setInterval(() => {
      setPlayNow((current) => {
        if (!current) {
          return null;
        }

        const plan = buildLivePlan({
          stops: stops.map((stop) => ({ time: stop.time, name: stop.name, notes: stop.notes })),
          date: resolveTripDate([dateHint, ...timing.dateCandidates], timing.timeZone, current),
          timeZone: timing.timeZone,
          now: current,
          reduceMotion: timing.reduceMotion,
        });

        return plan ? nextPlayInstant(current, plan) : null;
      });
    }, 200);

    return () => window.clearInterval(id);
  }, [playNow, timing, dateHint, stopKey, stops, candidateKey]);

  return {
    live,
    playing: playNow != null,
    start: () => {
      if (!live) {
        return;
      }

      setPlayNow(new Date(live.firstStart.getTime() - 6 * 60 * 1000));
    },
    stop: () => setPlayNow(null),
  };
}

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
  status,
}: {
  stop: ItineraryStop;
  isLast: boolean;
  status: LiveStopView | null;
}) {
  const hoursLabel = openingHoursLabel(stop.hours);

  return (
    <div className={`itinerary-view__timeline-row${status ? ` is-${status.status}` : ''}`}>
      <div className="itinerary-view__rail">
        <span className="itinerary-view__dot-wrap">
          {status?.status === 'done' ? (
            <span className="itinerary-view__dot is-done" aria-hidden>
              <Check size={12} strokeWidth={3} />
            </span>
          ) : (
            <span className={`itinerary-view__dot${status ? ` is-${status.status}` : ''}`} />
          )}
        </span>
        {!isLast ? (
          <span className="itinerary-view__line">
            <span
              className="itinerary-view__line-fill"
              style={{ height: `${Math.round((status?.lineFill ?? 0) * 100)}%` }}
            />
          </span>
        ) : null}
      </div>
      <article className={`itinerary-view__stop${status ? ` is-${status.status}` : ''}`}>
        <StopPhoto stop={stop} />
        {status ? (
          <div className="itinerary-view__hours-row">
            <p className="itinerary-view__stop-time">{status.windowLabel}</p>
            {status.chip ? (
              <span className={`itinerary-view__status is-${status.status}`}>{status.chip}</span>
            ) : null}
          </div>
        ) : null}
        {hoursLabel ? (
          <p className="itinerary-view__stop-time">
            <Clock size={14} />
            {hoursLabel}
          </p>
        ) : null}
        <h3 className="itinerary-view__stop-name">{stop.name}</h3>
        {stop.address ? <p className="itinerary-view__stop-hours">{stop.address}</p> : null}
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

function LiveBoard({
  live,
  playing,
  onPlay,
  onStop,
}: {
  live: NonNullable<ReturnType<typeof useLiveNight>['live']>;
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
}) {
  const { banner } = live;

  return (
    <div className="itinerary-view__live">
      <div className="itinerary-view__live-header">
        <span>ITINERARY</span>
        <span className="itinerary-view__live-clock">LIVE · {live.clockLabel}</span>
        <button type="button" className="itinerary-view__play" onClick={playing ? onStop : onPlay}>
          {playing ? 'Stop' : 'Play'}
        </button>
      </div>
      <div className="itinerary-view__banner">
        <p className="itinerary-view__banner-eyebrow">{banner.eyebrow}</p>
        <p className="itinerary-view__banner-name">{banner.name}</p>
        {banner.subtitle ? <p className="itinerary-view__banner-subtitle">{banner.subtitle}</p> : null}
        <p className="itinerary-view__banner-progress">{banner.doneLabel}</p>
        <p className="itinerary-view__banner-primary">{banner.primary}</p>
        {banner.secondary ? <p className="itinerary-view__banner-secondary">{banner.secondary}</p> : null}
      </div>
    </div>
  );
}

function TimedStops({
  stops,
  dateHint,
  timing,
}: {
  stops: ItineraryStop[];
  dateHint?: string | null;
  timing: LiveTiming | null;
}) {
  const night = useLiveNight(stops, dateHint, timing);

  return (
    <>
      {night.live ? (
        <LiveBoard live={night.live} playing={night.playing} onPlay={night.start} onStop={night.stop} />
      ) : null}
      {stops.map((stop, index) => (
        <StopRow
          key={`${stop.time}-${stop.name}-${index}`}
          stop={stop}
          isLast={index === stops.length - 1}
          status={night.live?.stops[index] ?? null}
        />
      ))}
    </>
  );
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

function DayBlock({ day, timing }: { day: ItineraryDay; timing: LiveTiming | null }) {
  return (
    <div className="itinerary-view__day">
      {day.date ? <h3>{day.date}</h3> : null}
      {day.theme ? <p className="itinerary-view__day-theme">{day.theme}</p> : null}
      <TimedStops stops={day.stops} dateHint={day.date} timing={timing} />
    </div>
  );
}

function DayTabs({ days, timing }: { days: ItineraryDay[]; timing: LiveTiming | null }) {
  const baseId = useId();
  const liveIndex = timing
    ? liveDayIndex(
        days.map((day) => day.date),
        timing.timeZone,
        timing.now,
      )
    : 0;
  const [picked, setPicked] = useState<number | null>(null);
  const selected = picked ?? liveIndex;
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
            onClick={() => setPicked(tabIndex)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${index}`}>
        {day ? <DayBlock day={day} timing={timing} /> : null}
      </div>
    </div>
  );
}

function ItineraryStops({ content, timing }: { content: ItineraryContent; timing: LiveTiming | null }) {
  const days = content.days ?? [];

  if (days.length > 1) {
    return <DayTabs days={days} timing={timing} />;
  }

  if (days.length === 1) {
    return <DayBlock day={days[0]} timing={timing} />;
  }

  return <TimedStops stops={content.stops ?? []} timing={timing} />;
}

export function ItineraryView({
  content,
  planType,
  fadeAfterStopCount,
  roadTripSummary,
  tripDates,
  eventCredits,
  timeZone,
  dateCandidates,
  now,
}: ItineraryViewProps) {
  const liveEnabled = Boolean(timeZone) && fadeAfterStopCount == null;
  const ticking = useTripClock(liveEnabled && now == null);
  const reduceMotion = usePrefersReducedMotion();
  const plan =
    planType === 'road_trip' ? withRoadTripDays(content, tripDates?.start, tripDates?.end) : content;
  const showRoadTripStrip =
    planType === 'road_trip' &&
    (roadTripSummary?.gas != null || roadTripSummary?.food != null || roadTripSummary?.driveTime);
  const parts = fadeAfterStopCount == null ? null : splitItineraryPreview(plan, fadeAfterStopCount);
  const visible = parts?.clear ?? plan;
  const faded = parts?.faded ?? null;
  const timing: LiveTiming | null =
    liveEnabled && timeZone
      ? {
          timeZone,
          now: now ?? ticking,
          dateCandidates: dateCandidates ?? [],
          reduceMotion,
        }
      : null;

  return (
    <section className="itinerary-view">
      <h2 className="itinerary-view__title">{plan.title}</h2>
      {plan.summary ? <p className="itinerary-view__summary">{plan.summary}</p> : null}
      <p className="itinerary-view__disclaimer">
        Hours of operation come from the place listing when we can match it. Double-check before you go.
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

      <ItineraryStops content={visible} timing={timing} />
      {faded ? (
        <div className="itinerary-view__locked" aria-hidden="true">
          <ItineraryStops content={faded} timing={null} />
        </div>
      ) : null}
      <EventCredits credits={eventCredits} />
    </section>
  );
}
