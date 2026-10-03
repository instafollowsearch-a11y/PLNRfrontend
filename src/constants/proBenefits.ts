export const PRO_HEADLINE = 'Your weekend is already planned.';

export const PRO_BUTTON_LABEL = 'Get Pro — $9.99/mo';

export const PRO_PRICE_NOTE = 'Less than the cover.';

export const PRO_UPGRADE_SUMMARY =
  'Your weekend is already planned. Friday, Saturday, and Sunday arrive from your interests.';

export const PRO_FRIDAY_LINES = [
  'Friday · Karaoke',
  'Saturday · Run club',
  'Sunday · Movie on the lawn',
] as const;

export const PRO_SAMPLE_CARDS = [
  {
    title: 'Alex and Jordan',
    lines: ['Same Saturday plan', 'View it together'],
  },
  {
    title: 'Reminder',
    lines: ['Market stop · Saturday · 10:00 AM', 'A reminder before you go'],
  },
] as const;

export const PRO_COMPARISON = [
  ['5 plans a month', 'Unlimited plans'],
  ['You ask for a plan', 'Friday–Sunday arrive on their own'],
  ['The plan is yours', 'Invite someone and view it together'],
  ['You remember the time', 'A reminder before each stop'],
] as const;

export function proSubline(priceLabel: string): string {
  return `Every Friday, PLNR sends Friday, Saturday, and Sunday from your interests. ${priceLabel}. Cancel anytime.`;
}

export function proFridayTitle(city?: string | null): string {
  const place = city?.trim();

  return place ? `Here's your weekend, ${place}` : "Here's your weekend, Donovan";
}
