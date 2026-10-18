import tzLookup from 'tz-lookup';

export type LiveStopStatus = 'done' | 'here' | 'next' | 'later';

export type LiveStopInput = {
  time: string;
  name: string;
  notes?: string;
};

export type LiveStopView = {
  status: LiveStopStatus;
  windowLabel: string;
  chip: string | null;
  /** How far the rail below this stop has filled, from 0 to 1. */
  lineFill: number;
  pulseMs: number | null;
};

export type LiveBannerView = {
  eyebrow: 'FIRST STOP' | 'NEXT STOP' | 'LAST STOP';
  name: string;
  subtitle: string;
  doneLabel: string;
  primary: string;
  secondary: string;
};

export type LivePlanView = {
  clockLabel: string;
  banner: LiveBannerView;
  stops: LiveStopView[];
  firstStart: Date;
  lastEnd: Date;
};

const MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

type Clock = {
  hour: number;
  minute: number;
  meridiem: string | null;
};

export function timezoneFromCoordinates(lat: number, lon: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }

  try {
    const zone = tzLookup(lat, lon);

    return typeof zone === 'string' && isValidTimeZone(zone) ? zone : null;
  } catch {
    return null;
  }
}

export function pulsePeriodMs(minutesUntil: number, reduceMotion: boolean): number | null {
  if (reduceMotion) {
    return null;
  }

  if (minutesUntil >= 30) {
    return 1800;
  }

  if (minutesUntil >= 10) {
    return 1200;
  }

  return 750;
}

export function parseCalendarDate(
  value: string | null | undefined,
  timeZone: string,
  now: Date,
): string | null {
  const text = value?.trim() ?? '';

  if (text === '' || !isValidTimeZone(timeZone)) {
    return null;
  }

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  const withYear = text.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);

  if (withYear && MONTHS[withYear[1].toLowerCase()]) {
    return ymd(Number(withYear[3]), MONTHS[withYear[1].toLowerCase()], Number(withYear[2]));
  }

  const monthDay = text.match(/([A-Za-z]+)\s+(\d{1,2})\b/);

  if (!monthDay || !MONTHS[monthDay[1].toLowerCase()]) {
    return null;
  }

  const today = todayYmd(now, timeZone);
  const year = Number(today.slice(0, 4));
  const month = MONTHS[monthDay[1].toLowerCase()];
  const day = Number(monthDay[2]);
  let candidate = ymd(year, month, day);
  const todayTime = Date.parse(`${today}T12:00:00Z`);
  const candidateTime = Date.parse(`${candidate}T12:00:00Z`);

  if (todayTime - candidateTime > 180 * 24 * 60 * 60 * 1000) {
    candidate = ymd(year + 1, month, day);
  }

  return candidate;
}

export function resolveTripDate(
  candidates: Array<string | null | undefined>,
  timeZone: string,
  now: Date,
): string {
  for (const candidate of candidates) {
    const parsed = parseCalendarDate(candidate, timeZone, now);

    if (parsed) {
      return parsed;
    }
  }

  return todayYmd(now, timeZone);
}

/** The day tab that matches today in the trip zone, or the latest day already reached. */
export function liveDayIndex(
  dates: Array<string | null | undefined>,
  timeZone: string,
  now: Date,
): number {
  if (dates.length === 0 || !isValidTimeZone(timeZone)) {
    return 0;
  }

  const today = todayYmd(now, timeZone);
  const parsed = dates.map((date) => parseCalendarDate(date, timeZone, now));
  const exact = parsed.findIndex((date) => date === today);

  if (exact >= 0) {
    return exact;
  }

  let latestStarted = -1;

  parsed.forEach((date, index) => {
    if (date && date <= today) {
      latestStarted = index;
    }
  });

  return latestStarted >= 0 ? latestStarted : 0;
}

function segmentFill(from: Date, to: Date, now: Date): number {
  const start = from.getTime();
  const end = to.getTime();
  const at = now.getTime();

  if (end <= start) {
    return at >= end ? 1 : 0;
  }

  if (at <= start) {
    return 0;
  }

  if (at >= end) {
    return 1;
  }

  return (at - start) / (end - start);
}

export function buildLivePlan(input: {
  stops: LiveStopInput[];
  date: string;
  timeZone: string;
  now: Date;
  reduceMotion?: boolean;
}): LivePlanView | null {
  if (!isValidTimeZone(input.timeZone) || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return null;
  }

  const windows = scheduleStops(input.stops, input.date, input.timeZone);

  if (!windows) {
    return null;
  }

  const reduceMotion = input.reduceMotion === true;
  const views: LiveStopView[] = windows.map(() => ({
    status: 'later',
    windowLabel: '',
    chip: null,
    lineFill: 0,
    pulseMs: null,
  }));

  let nextIndex = -1;
  let hereIndex = -1;

  windows.forEach((window, index) => {
    views[index].windowLabel = formatWindow(window.start, window.end, input.timeZone);

    if (input.now.getTime() >= window.end.getTime()) {
      views[index].status = 'done';
      views[index].chip = 'Done';

      return;
    }

    if (input.now.getTime() >= window.start.getTime()) {
      views[index].status = 'here';
      views[index].chip = "You're here";
      hereIndex = index;

      return;
    }

    if (nextIndex === -1) {
      nextIndex = index;
    }
  });

  if (nextIndex !== -1) {
    const remainingMs = windows[nextIndex].start.getTime() - input.now.getTime();
    const minutesUntil = Math.max(0, Math.round(remainingMs / 60000));
    const arriving = remainingMs < 5 * 60 * 1000;
    views[nextIndex].status = 'next';
    views[nextIndex].chip = arriving ? 'Arriving' : `Next · in ${Math.max(1, minutesUntil)} min`;
    views[nextIndex].pulseMs = pulsePeriodMs(minutesUntil, reduceMotion);
  }

  windows.forEach((window, index) => {
    if (index >= windows.length - 1) {
      return;
    }

    views[index].lineFill = segmentFill(window.start, windows[index + 1].start, input.now);
  });

  const doneCount = views.filter((stop) => stop.status === 'done').length;
  const focusIndex = hereIndex === windows.length - 1 ? hereIndex : nextIndex === -1 ? windows.length - 1 : nextIndex;
  const focus = windows[focusIndex];
  const here = hereIndex === -1 ? null : windows[hereIndex];
  const onLast = hereIndex === windows.length - 1;
  const beforeFirst = doneCount === 0 && hereIndex === -1;
  const remainingMs = focus.start.getTime() - input.now.getTime();
  const minutesUntil = Math.max(0, Math.round(remainingMs / 60000));
  const arriving = nextIndex !== -1 && remainingMs < 5 * 60 * 1000 && remainingMs >= 0;

  let eyebrow: LiveBannerView['eyebrow'] = 'NEXT STOP';
  let subtitle = `Heading over from ${windows[Math.max(0, focusIndex - 1)].name}`;
  let primary = arriving ? 'Arriving' : `${Math.max(1, minutesUntil)} min`;
  let secondary = `Starts ${clockLabel(focus.start, input.timeZone)}`;

  if (onLast && here) {
    eyebrow = 'LAST STOP';
    subtitle = 'Last stop of the night';
    primary = 'Now';
    secondary = `Until ${clockLabel(here.end, input.timeZone)}`;
  } else if (beforeFirst) {
    eyebrow = 'FIRST STOP';
    subtitle = 'First stop of the night';
  } else if (here && nextIndex !== -1) {
    subtitle = `You're at ${here.name} until ${clockLabel(here.end, input.timeZone)}`;
  } else if (nextIndex === -1) {
    eyebrow = 'LAST STOP';
    subtitle = 'Last stop of the night';
    primary = 'Done';
    secondary = '';
  } else if (focusIndex === 0) {
    eyebrow = 'FIRST STOP';
  }

  return {
    clockLabel: clockLabel(input.now, input.timeZone),
    banner: {
      eyebrow,
      name: onLast && here ? here.name : focus.name,
      subtitle,
      doneLabel: `${doneCount} of ${windows.length} done`,
      primary,
      secondary,
    },
    stops: views,
    firstStart: windows[0].start,
    lastEnd: windows[windows.length - 1].end,
  };
}

export function nextPlayInstant(now: Date, live: LivePlanView): Date | null {
  if (now.getTime() >= live.lastEnd.getTime() + 5 * 60 * 1000) {
    return null;
  }

  const upcoming = live.stops.find((stop) => stop.status === 'next');
  const minutesUntil = minutesFromChip(upcoming?.chip ?? null);
  const step = upcoming && (upcoming.chip === 'Arriving' || minutesUntil < 8) ? 15 * 1000 : 5 * 60 * 1000;

  return new Date(now.getTime() + step);
}

function minutesFromChip(chip: string | null): number {
  const match = chip?.match(/(\d+)\s*min/);

  return match ? Number(match[1]) : 99;
}

type Window = {
  name: string;
  start: Date;
  end: Date;
};

function scheduleStops(stops: LiveStopInput[], date: string, timeZone: string): Window[] | null {
  if (stops.length === 0) {
    return null;
  }

  const placed: Array<{ name: string; startMin: number; endMin: number | null }> = [];
  let previousStart = -1;

  for (const stop of stops) {
    const parsed = parseTimeRange(stop.time);

    if (!parsed) {
      return null;
    }

    let startMin = parsed.start;

    if (previousStart !== -1 && startMin + 90 < previousStart) {
      startMin += 24 * 60;
    }

    let endMin = parsed.end;

    if (endMin !== null && endMin <= parsed.start) {
      endMin += 24 * 60;
    }

    if (endMin !== null) {
      endMin += startMin - parsed.start;
    }

    placed.push({ name: stop.name, startMin, endMin });
    previousStart = startMin;
  }

  const windows: Window[] = placed.map((stop, index) => {
    const next = placed[index + 1];
    let endMin = stop.endMin;

    if (endMin === null) {
      endMin = next ? next.startMin : stop.startMin + (durationMinutes(stops[index].notes ?? '') ?? 90);
    }

    if (endMin <= stop.startMin) {
      endMin += 24 * 60;
    }

    return {
      name: stop.name,
      start: minutesToDate(date, stop.startMin, timeZone),
      end: minutesToDate(date, endMin, timeZone),
    };
  });

  return windows;
}

function parseTimeRange(time: string): { start: number; end: number | null } | null {
  const matches = [...time.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi)];

  if (matches.length === 0) {
    return null;
  }

  const clocks: Clock[] = matches.map((match) => ({
    hour: Number(match[1]),
    minute: Number(match[2] ?? 0),
    meridiem: match[3] ? match[3].toLowerCase() : null,
  }));
  const known = [...clocks].reverse().find((clock) => clock.meridiem)?.meridiem ?? null;
  const start = clockMinutes(clocks[0], clocks[0].meridiem ?? known);
  const end = clocks[1] ? clockMinutes(clocks[1], clocks[1].meridiem ?? known) : null;

  if (start === null || (clocks[1] && end === null)) {
    return null;
  }

  return { start, end };
}

function clockMinutes(clock: Clock, inherited: string | null): number | null {
  const { hour, minute } = clock;
  const meridiem = clock.meridiem ?? inherited;
  let normalized = hour;

  if (minute > 59 || hour > 23) {
    return null;
  }

  if (meridiem === 'pm' && normalized < 12) {
    normalized += 12;
  }

  if (meridiem === 'am' && normalized === 12) {
    normalized = 0;
  }

  if (!meridiem && normalized > 23) {
    return null;
  }

  return normalized * 60 + minute;
}

function durationMinutes(notes: string): number | null {
  const hours = notes.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i);

  if (hours) {
    return Math.round(Number(hours[1]) * 60);
  }

  const minutes = notes.match(/(\d+)\s*(?:minutes?|mins?)/i);

  return minutes ? Number(minutes[1]) : null;
}

function minutesToDate(date: string, minutes: number, timeZone: string): Date {
  const dayOffset = Math.floor(minutes / (24 * 60));
  const clock = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const [year, month, day] = date.split('-').map(Number);
  const utc = Date.UTC(year, month - 1, day + dayOffset, Math.floor(clock / 60), clock % 60, 0);
  const offset = timezoneOffsetMs(new Date(utc), timeZone);
  const zoned = new Date(utc - offset);
  const corrected = timezoneOffsetMs(zoned, timeZone);

  return corrected === offset ? zoned : new Date(utc - corrected);
}

function timezoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = map.hour === '24' ? '0' : map.hour;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(hour),
    Number(map.minute),
    Number(map.second),
  );

  return asUtc - instant.getTime();
}

function formatWindow(start: Date, end: Date, timeZone: string): string {
  const startParts = clockParts(start, timeZone);
  const endParts = clockParts(end, timeZone);

  if (startParts.dayPeriod && startParts.dayPeriod === endParts.dayPeriod) {
    return `${startParts.hour}:${startParts.minute} – ${endParts.hour}:${endParts.minute} ${endParts.dayPeriod}`;
  }

  return `${clockLabel(start, timeZone)} – ${clockLabel(end, timeZone)}`;
}

function clockLabel(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(instant);
}

function clockParts(instant: Date, timeZone: string): { hour: string; minute: string; dayPeriod: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).formatToParts(instant);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    hour: map.hour ?? '',
    minute: map.minute ?? '00',
    dayPeriod: (map.dayPeriod ?? '').toUpperCase(),
  };
}

function todayYmd(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${map.year}-${map.month}-${map.day}`;
}

function ymd(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone });

    return true;
  } catch {
    return false;
  }
}
