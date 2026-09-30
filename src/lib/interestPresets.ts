export const DATE_NIGHT_INTEREST_PRESETS = [
  'Open to suggestions',
  'Club / nightlife',
  'Art museums',
  'Wine bars',
  'Live music',
  'Romantic dinners',
  'Sunset views',
  'Coffee dates',
  'Theater',
  'Cooking classes',
  'Dancing',
  'Bookstores',
  'Parks & picnics',
  'Photography walks',
] as const;

export const NIGHT_OUT_INTEREST_PRESETS = [
  'Open to suggestions',
  'Club / nightlife',
  'Live jazz',
  'Rooftop bars',
  'Tacos & street food',
  'Craft beer',
  'Comedy shows',
  'Dancing',
  'Sports bars',
  'Karaoke',
  'Fine dining',
  'Food trucks',
  'Art galleries',
  'Game nights',
] as const;

export const VACATION_INTEREST_PRESETS = [
  'Open to suggestions',
  'Beaches',
  'Food tours',
  'Architecture',
  'Museums',
  'Nightlife',
  'Hiking',
  'Shopping',
  'Local markets',
  'Wine tasting',
  'History',
  'Photography',
  'Wellness & spas',
] as const;

export const ROAD_TRIP_STOP_PRESETS = [
  'Scenic viewpoints',
  'Small towns',
  'Hiking trails',
  'National parks',
  'Roadside diners',
  'Antique shops',
  'Lakes & rivers',
  'Historic sites',
  'Local breweries',
  'Farm stands',
] as const;

export const ROAD_TRIP_INTEREST_PRESETS = [
  'Open to suggestions',
  'Club / nightlife',
  'Nature',
  'Photography',
  'Local food',
  'Music landmarks',
  'Camping',
  'Hiking',
  'Museums',
  'Vintage shops',
  'Wildlife',
  'Stargazing',
] as const;

export const FOOD_PREFERENCE_PRESETS = [
  'BBQ',
  'Diners',
  'Vegetarian',
  'Seafood',
  'Mexican',
  'Italian',
  'Coffee shops',
  'Farm-to-table',
  'Asian fusion',
  'Burgers',
  'Bakeries',
  'Vegan options',
] as const;

export type InterestValue = {
  selected: string[];
  custom: string;
};

export function buildInterestString(value: InterestValue): string {
  const parts = [...value.selected];

  if (value.custom.trim()) {
    parts.push(value.custom.trim());
  }

  return parts.join(', ');
}

export function parseInterestValue(raw: string, presets: readonly string[]): InterestValue {
  if (!raw.trim()) {
    return { selected: [], custom: '' };
  }

  try {
    const parsed = JSON.parse(raw) as InterestValue;

    if (Array.isArray(parsed.selected)) {
      return {
        selected: parsed.selected,
        custom: typeof parsed.custom === 'string' ? parsed.custom : '',
      };
    }
  } catch {
    // fall through to comma-separated parsing
  }

  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const presetSet = new Set<string>(presets);
  const selected = parts.filter((part) => presetSet.has(part));
  const custom = parts.filter((part) => !presetSet.has(part)).join(', ');

  return { selected, custom };
}

export function encodeInterestValue(value: InterestValue): string {
  return JSON.stringify(value);
}
