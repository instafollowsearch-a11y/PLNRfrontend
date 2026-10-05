import { ExternalLink } from 'lucide-react';

import { Card } from '../ui/Card';
import type { EventCredit, SaturdayPlan, WeekendRecommendationItem } from '../../lib/apiTypes';
import { itemsForDay, usesWeekendDays, WEEKEND_DAYS } from '../../lib/weekendDays';
import '../../pages/WeekendPage.css';

interface WeekendPicksResultsProps {
  items: WeekendRecommendationItem[];
  saturdayPlan?: SaturdayPlan | null;
  eventCredits?: EventCredit[];
}

function formatEventDate(value: string | null): string {
  if (!value) {
    return 'Date TBA';
  }

  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isFindLocalEventPage(href: string): boolean {
  return href.startsWith('https://findlocal.community/event/');
}

function EventCard({ item }: { item: WeekendRecommendationItem }) {
  const findLocalUrl =
    item.source === 'findlocal' && item.url && isFindLocalEventPage(item.url) ? item.url : null;

  return (
    <Card className="weekend-page__event">
      <div className="weekend-page__event-head">
        <h3>{item.title}</h3>
        {item.url && !findLocalUrl ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="weekend-page__event-link"
            aria-label={`Open ${item.title}`}
          >
            <ExternalLink size={16} />
          </a>
        ) : null}
      </div>
      <p className="weekend-page__event-venue">{item.venue || 'Venue TBA'}</p>
      <p className="weekend-page__event-time">{formatEventDate(item.starts_at)}</p>
      <p className="weekend-page__event-reason">{item.reason}</p>
      {findLocalUrl ? (
        <a href={findLocalUrl} target="_blank" rel="noreferrer" className="weekend-page__findlocal">
          View on Find Local
        </a>
      ) : null}
    </Card>
  );
}

function EventCredits({ credits }: { credits?: EventCredit[] }) {
  const visible = (credits ?? []).filter((credit) => credit.url && credit.label);

  if (visible.length === 0) {
    return null;
  }

  return (
    <p className="weekend-page__credit">
      {visible.map((credit) => (
        <a key={credit.source} href={credit.url} target="_blank" rel="noreferrer">
          {credit.label}
        </a>
      ))}
    </p>
  );
}

export function WeekendPicksResults({ items, saturdayPlan, eventCredits }: WeekendPicksResultsProps) {
  if (!usesWeekendDays(items)) {
    return (
      <div className="weekend-page__list">
        {items.map((item) => (
          <EventCard key={item.event_id} item={item} />
        ))}
        <EventCredits credits={eventCredits} />
      </div>
    );
  }

  return (
    <div className="weekend-page__list">
      {WEEKEND_DAYS.map((day) => {
        const dayItems = itemsForDay(items, day);

        return (
          <section key={day} aria-label={day}>
            <h3 className="weekend-page__day">{day}</h3>
            {dayItems.length === 0 ? <p className="weekend-page__empty">Nothing listed.</p> : null}
            {dayItems.map((item) => (
              <EventCard key={item.event_id} item={item} />
            ))}
          </section>
        );
      })}

      {saturdayPlan ? (
        <section aria-label="Saturday plan" className="weekend-page__plan">
          <h3 className="weekend-page__day">Saturday plan</h3>
          <Card className="weekend-page__event">
            <h3>{saturdayPlan.title}</h3>
            <p className="weekend-page__event-reason">{saturdayPlan.summary}</p>
            <ol className="weekend-page__stops">
              {saturdayPlan.stops.map((stop) => {
                const matched = items.find((item) => item.day === 'Saturday' && item.title === stop.name);
                const when = matched?.starts_at ? formatEventDate(matched.starts_at) : stop.time;

                return (
                  <li key={`${stop.time}-${stop.name}`}>
                    <strong>{when}</strong> {stop.name}
                    {stop.detail ? ` — ${stop.detail}` : ''}
                  </li>
                );
              })}
            </ol>
          </Card>
        </section>
      ) : null}
      <EventCredits credits={eventCredits} />
    </div>
  );
}
