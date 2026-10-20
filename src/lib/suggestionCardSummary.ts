import type { PlanTypeSlug } from '../constants/planFlowConfig';
import type { SuggestionPayload } from './apiTypes';

const HOOK_MAX = 110;
const MAX_CHIPS = 4;
const MAX_PLACE_CHIPS = 2;

export type SuggestionChipKind = 'time' | 'drive' | 'stops' | 'place';

export type SuggestionChip = {
  label: string;
  kind: SuggestionChipKind;
};

export type SuggestionCardSummary = {
  title: string;
  hook: string;
  eyebrow: string | null;
  priceAmount: string | null;
  priceSuffix: string | null;
  /** Combined label for tests and accessibility, e.g. "$38 total". */
  priceLabel: string | null;
  chips: SuggestionChip[];
};

const PLAN_EYEBROWS: Record<PlanTypeSlug, string> = {
  date_night: 'Date night',
  night_out: 'Night out',
  vacation: 'Vacation',
  road_trip: 'Road trip',
};

function firstSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return '';
  }

  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  return match?.[1]?.trim() || trimmed;
}

export function shortenHook(description: string | null | undefined, maxLength = HOOK_MAX): string {
  const sentence = firstSentence(String(description ?? ''));
  if (!sentence) {
    return '';
  }

  if (sentence.length <= maxLength) {
    return sentence;
  }

  const cut = sentence.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}

function formatMoney(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(0)}`;
}

type PriceParts = { amount: string; suffix: string };

function pricePartsForSuggestion(
  payload: SuggestionPayload | null | undefined,
  planType?: PlanTypeSlug,
): PriceParts | null {
  if (!payload) {
    return null;
  }

  if (planType === 'night_out' && payload.estimated_cost_per_person != null) {
    return { amount: formatMoney(payload.estimated_cost_per_person), suffix: '/ person' };
  }

  if (planType === 'date_night' && payload.estimated_cost != null) {
    return { amount: formatMoney(payload.estimated_cost), suffix: 'total' };
  }

  if (planType === 'vacation' && payload.estimated_cost_total != null) {
    return { amount: formatMoney(payload.estimated_cost_total), suffix: 'trip' };
  }

  if (planType === 'road_trip') {
    const gas = payload.estimated_gas_cost;
    const food = payload.estimated_food_cost;
    if (gas != null && food != null) {
      return { amount: formatMoney(gas + food), suffix: 'total' };
    }
    if (gas != null) {
      return { amount: formatMoney(gas), suffix: 'gas' };
    }
    if (food != null) {
      return { amount: formatMoney(food), suffix: 'food' };
    }
  }

  if (payload.estimated_cost != null) {
    return { amount: formatMoney(payload.estimated_cost), suffix: 'total' };
  }
  if (payload.estimated_cost_total != null) {
    return { amount: formatMoney(payload.estimated_cost_total), suffix: 'trip' };
  }
  if (payload.estimated_cost_per_person != null) {
    return { amount: formatMoney(payload.estimated_cost_per_person), suffix: '/ person' };
  }

  return null;
}

export function priceLabelForSuggestion(
  payload: SuggestionPayload | null | undefined,
  planType?: PlanTypeSlug,
): string | null {
  const parts = pricePartsForSuggestion(payload, planType);
  if (!parts) {
    return null;
  }

  return `${parts.amount} ${parts.suffix}`;
}

function placeChips(payload: SuggestionPayload): SuggestionChip[] {
  const venues = Array.isArray(payload.venues)
    ? payload.venues.map((item) => item.trim()).filter(Boolean)
    : [];
  if (venues.length > 0) {
    return venues.slice(0, MAX_PLACE_CHIPS).map((label) => ({ label, kind: 'place' as const }));
  }

  const stops = Array.isArray(payload.stops)
    ? payload.stops.map((stop) => stop.name?.trim()).filter((name): name is string => Boolean(name))
    : [];

  return stops.slice(0, MAX_PLACE_CHIPS).map((label) => ({ label, kind: 'place' as const }));
}

export function chipsForSuggestion(
  payload: SuggestionPayload | null | undefined,
  planType?: PlanTypeSlug,
): SuggestionChip[] {
  if (!payload) {
    return [];
  }

  const chips: SuggestionChip[] = [];

  const timeSlot = payload.time_slot?.trim();
  if (timeSlot) {
    chips.push({ label: timeSlot, kind: 'time' });
  }

  if (planType === 'road_trip') {
    const drive = payload.total_drive_time?.trim();
    if (drive) {
      chips.push({ label: drive, kind: 'drive' });
    }

    const stopCount = Array.isArray(payload.stops) ? payload.stops.length : 0;
    if (stopCount > 0) {
      chips.push({
        label: `${stopCount} stop${stopCount === 1 ? '' : 's'}`,
        kind: 'stops',
      });
    }
  }

  for (const place of placeChips(payload)) {
    if (chips.length >= MAX_CHIPS) {
      break;
    }
    chips.push(place);
  }

  return chips.slice(0, MAX_CHIPS);
}

export function summarizeSuggestionCard(
  payload: SuggestionPayload | null | undefined,
  planType?: PlanTypeSlug,
): SuggestionCardSummary {
  const safe = payload ?? { name: '', description: '' };
  const price = pricePartsForSuggestion(safe, planType);

  return {
    title: String(safe.name ?? '').trim(),
    hook: shortenHook(safe.description),
    eyebrow: planType ? PLAN_EYEBROWS[planType] : null,
    priceAmount: price?.amount ?? null,
    priceSuffix: price?.suffix ?? null,
    priceLabel: price ? `${price.amount} ${price.suffix}` : null,
    chips: chipsForSuggestion(safe, planType),
  };
}
