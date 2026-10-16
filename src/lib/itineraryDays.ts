import type { ItineraryContent, ItineraryStop } from './apiTypes';

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function weekdayOf(date: string): string | null {
  const trimmed = date.trim();
  const named = WEEKDAY_NAMES.find((day) => trimmed.toLowerCase().startsWith(day.toLowerCase()));

  if (named) {
    return named;
  }

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (iso) {
    const local = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

    return WEEKDAY_NAMES[local.getDay()] ?? null;
  }

  const parsed = Date.parse(trimmed);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return WEEKDAY_NAMES[new Date(parsed).getDay()] ?? null;
}

function shortMonthDay(date: string, weekday: string): string | null {
  const rest = date.trim().replace(new RegExp(`^${weekday},?\\s*`, 'i'), '');
  const match = rest.match(/^([A-Za-z]+)\s+(\d{1,2})\b/);

  if (!match) {
    return null;
  }

  return `${match[1].slice(0, 3)} ${Number(match[2])}`;
}

/** Tab names for a multi-day plan. A repeated weekday keeps the month and day. */
export function dayTabLabels(dates: Array<string | null | undefined>): string[] {
  const weekdays = dates.map((date) => weekdayOf(date ?? ''));
  const counts = new Map<string, number>();

  for (const weekday of weekdays) {
    if (!weekday) {
      continue;
    }

    counts.set(weekday, (counts.get(weekday) ?? 0) + 1);
  }

  return dates.map((date, index) => {
    const label = (date ?? '').trim();
    const weekday = weekdays[index];

    if (!weekday) {
      return label || `Day ${index + 1}`;
    }

    if ((counts.get(weekday) ?? 0) > 1) {
      const short = shortMonthDay(label, weekday);

      return short ? `${weekday}, ${short}` : weekday;
    }

    return weekday;
  });
}

/**
 * A road trip is one stop list. Split it into the same day tabs a vacation uses
 * when the drive covers more than one day.
 */
export function withRoadTripDays(
  content: ItineraryContent,
  start?: string | null,
  end?: string | null,
): ItineraryContent {
  if ((content.days?.length ?? 0) > 0) {
    return content;
  }

  const stops = content.stops ?? [];

  if (stops.length === 0) {
    return content;
  }

  const byClock = groupByClock(stops);
  const span = tripDayCount(start, end);
  const groups = byClock.length > 1 ? byClock : span > 1 ? chunkStops(stops, span) : [];

  if (groups.length < 2) {
    return content;
  }

  const labels = dateLabels(start, end, groups.length);

  return {
    ...content,
    stops: undefined,
    days: groups.map((dayStops, index) => ({
      date: labels[index] ?? `Day ${index + 1}`,
      theme: '',
      stops: dayStops,
    })),
  };
}

function groupByClock(stops: ItineraryStop[]): ItineraryStop[][] {
  const groups: ItineraryStop[][] = [[]];
  let previousClock: number | null = null;
  let previousDay: number | null = null;

  for (const stop of stops) {
    const day = dayNumber(stop);
    const clock = clockMinutes(stop.time);
    const rolledBack = clock !== null && previousClock !== null && clock + 90 < previousClock;
    const nextDay = day !== null && previousDay !== null && day !== previousDay;

    if ((rolledBack || nextDay) && groups[groups.length - 1].length > 0) {
      groups.push([]);
    }

    groups[groups.length - 1].push(stop);

    if (day !== null) {
      previousDay = day;
    }

    if (clock !== null) {
      previousClock = clock;
    }
  }

  return groups.filter((group) => group.length > 0);
}

function chunkStops(stops: ItineraryStop[], days: number): ItineraryStop[][] {
  const count = Math.min(Math.max(days, 1), stops.length);
  const base = Math.floor(stops.length / count);
  let extra = stops.length % count;
  const groups: ItineraryStop[][] = [];
  let index = 0;

  for (let day = 0; day < count; day += 1) {
    const size = base + (extra > 0 ? 1 : 0);

    if (extra > 0) {
      extra -= 1;
    }

    groups.push(stops.slice(index, index + size));
    index += size;
  }

  return groups.filter((group) => group.length > 0);
}

function dayNumber(stop: ItineraryStop): number | null {
  const match = `${stop.time} ${stop.activity} ${stop.notes}`.match(/\bday\s*(\d+)\b/i);

  return match ? Number(match[1]) : null;
}

function clockMinutes(time: string): number | null {
  const match = time.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const meridiem = match[3]?.toLowerCase();

  if (hours > 23 || minutes > 59) {
    return null;
  }

  if (meridiem === 'pm' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function tripDayCount(start?: string | null, end?: string | null): number {
  const first = parseTripDate(start ?? '');
  const last = parseTripDate(end ?? '');

  if (!first || !last) {
    return 1;
  }

  const diff = Math.round((last.getTime() - first.getTime()) / 86_400_000);

  return diff >= 0 ? diff + 1 : 1;
}

function dateLabels(start: string | null | undefined, end: string | null | undefined, count: number): string[] {
  const first = parseTripDate(start ?? '');
  const last = parseTripDate(end ?? '');

  if (!first) {
    return Array.from({ length: count }, (_, index) => `Day ${index + 1}`);
  }

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(first);
    date.setDate(first.getDate() + index);

    if (last && date.getTime() > last.getTime()) {
      date.setTime(last.getTime());
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  });
}

function parseTripDate(value: string): Date | null {
  const trimmed = value.trim();

  if (trimmed === '') {
    return null;
  }

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  const withYear = /\d{4}/.test(trimmed) ? trimmed : `${trimmed}, ${new Date().getFullYear()}`;
  const parsed = new Date(withYear);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}
