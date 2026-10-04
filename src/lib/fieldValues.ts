import type { QuestionConfig } from '../constants/questionFlows';

import { buildInterestString, parseInterestValue } from './interestPresets';

export type DateRangeValue = {
  start: string;
  end: string;
};

export type DateTimeRangeValue = {
  date: string;
  start: string;
  end: string;
};

export type LocationValue = {
  label: string;
  lat: number;
  lon: number;
};

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) {
    return '';
  }

  const date = new Date(`${isoDate}T12:00:00`);

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) {
    return '';
  }

  const date = new Date(`${isoDate}T12:00:00`);

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDisplayTime(timeValue: string): string {
  if (!timeValue) {
    return '';
  }

  const [hours, minutes] = timeValue.split(':').map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return timeValue;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function serializeAnswerForApi(question: QuestionConfig, rawValue: string): string {
  switch (question.type) {
    case 'date':
      return formatDisplayDate(rawValue);
    case 'time':
      return formatDisplayTime(rawValue);
    case 'date_range': {
      const range = parseJson<DateRangeValue>(rawValue);

      if (!range?.start || !range.end) {
        return rawValue;
      }

      return `${formatShortDate(range.start)} – ${formatShortDate(range.end)}`;
    }
    case 'datetime_range': {
      const range = parseJson<DateTimeRangeValue>(rawValue);

      if (!range?.date || !range.start || !range.end) {
        return rawValue;
      }

      const day = formatDisplayDate(range.date);
      const start = formatDisplayTime(range.start);
      const end = formatDisplayTime(range.end);

      return `${day}, ${start} – ${end}`;
    }
    case 'location': {
      const location = parseJson<LocationValue>(rawValue);

      if (!location?.label) {
        return rawValue;
      }

      if (question.key === 'area_center') {
        return JSON.stringify({
          label: location.label,
          lat: location.lat,
          lon: location.lon,
        });
      }

      return location.label;
    }
    case 'interests': {
      const parsed = parseInterestValue(rawValue, question.interestOptions ?? []);

      return buildInterestString(parsed);
    }
    default:
      return rawValue;
  }
}

export function serializeAnswersForApi(
  questions: QuestionConfig[],
  answers: Record<string, string>,
): Record<string, string> {
  const serialized: Record<string, string> = {};

  for (const question of questions) {
    const raw = answers[question.key];

    if (raw === undefined) {
      continue;
    }

    serialized[question.key] = serializeAnswerForApi(question, raw);
  }

  return serialized;
}

export function isAnswerComplete(question: QuestionConfig, rawValue: string): boolean {
  if (!rawValue.trim()) {
    return false;
  }

  switch (question.type) {
    case 'number':
      return !Number.isNaN(Number(rawValue));
    case 'date_range': {
      const range = parseJson<DateRangeValue>(rawValue);

      return Boolean(range?.start && range.end && range.end >= range.start);
    }
    case 'datetime_range': {
      const range = parseJson<DateTimeRangeValue>(rawValue);

      return Boolean(range?.date && range.start && range.end);
    }
    case 'location': {
      const location = parseJson<LocationValue>(rawValue);

      return Boolean(location?.label?.trim());
    }
    case 'interests': {
      const parsed = parseInterestValue(rawValue, question.interestOptions ?? []);

      return buildInterestString(parsed).trim().length >= 3;
    }
    default:
      return rawValue.trim().length > 0;
  }
}
