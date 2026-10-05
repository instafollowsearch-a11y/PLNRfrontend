import type { ItineraryContent, ItineraryDay } from './apiTypes';

/** Stops a guest can read before the rest of the plan fades. */
export const GUEST_CLEAR_STOP_COUNT = 2;

export interface ItineraryPreviewParts {
  clear: ItineraryContent;
  faded: ItineraryContent | null;
}

/** Keep the first stops readable and return the rest so the screen can fade them. */
export function splitItineraryPreview(
  content: ItineraryContent,
  clearCount = GUEST_CLEAR_STOP_COUNT,
): ItineraryPreviewParts {
  if (content.days && content.days.length > 0) {
    return splitDays(content, clearCount);
  }

  const stops = content.stops ?? [];
  const clearStops = stops.slice(0, clearCount);
  const fadedStops = stops.slice(clearCount);

  return {
    clear: { ...content, stops: clearStops },
    faded: fadedStops.length > 0 ? { ...content, summary: '', stops: fadedStops } : null,
  };
}

function splitDays(content: ItineraryContent, clearCount: number): ItineraryPreviewParts {
  const clearDays: ItineraryDay[] = [];
  const fadedDays: ItineraryDay[] = [];
  let remaining = clearCount;

  for (const day of content.days ?? []) {
    if (remaining <= 0) {
      fadedDays.push(day);
      continue;
    }

    const clearStops = day.stops.slice(0, remaining);
    const fadedStops = day.stops.slice(clearStops.length);
    remaining -= clearStops.length;

    if (clearStops.length > 0) {
      clearDays.push({ ...day, stops: clearStops });
    }

    if (fadedStops.length > 0) {
      fadedDays.push({ date: '', theme: '', stops: fadedStops });
    }
  }

  return {
    clear: { ...content, days: clearDays, stops: undefined },
    faded: fadedDays.length > 0 ? { ...content, summary: '', days: fadedDays, stops: undefined } : null,
  };
}
