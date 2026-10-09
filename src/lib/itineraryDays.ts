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
