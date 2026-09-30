import type { ItineraryContent } from './apiTypes';

/** Title, summary, and the first stop. Later stops stay off the guest screen. */
export function previewItinerary(content: ItineraryContent): ItineraryContent {
  if (content.days && content.days.length > 0) {
    const day = content.days[0];

    return {
      title: content.title,
      summary: content.summary,
      days: [
        {
          date: day.date,
          theme: day.theme,
          stops: day.stops.slice(0, 1),
        },
      ],
    };
  }

  return {
    title: content.title,
    summary: content.summary,
    stops: (content.stops ?? []).slice(0, 1),
  };
}
