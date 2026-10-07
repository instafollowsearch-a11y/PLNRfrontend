export const PRO_HEADLINE = 'Your weekend is already planned.';

export const PRO_BUTTON_LABEL = 'Get Pro — $9.99/mo';

export const PRO_PRICE_NOTE = 'Less than the cover.';

export const PRO_UPGRADE_SUMMARY = 'Custom weekend plans and interest pings.';

export const PRO_QUOTES = [
  {
    title: 'Custom weekend plans',
    body: 'Curated and delivered for you automatically based on your interests.',
    quote: 'Hello Donovan here is your weekend schedule',
    icon: 'calendar',
  },
  {
    title: 'View plans together',
    body: 'In real time.',
    quote: 'Del is viewing this plan',
    icon: 'people',
  },
  {
    title: 'Ping notifications',
    body: 'Based off your interests.',
    quote: 'Did you know this is happening today?',
    icon: 'bell',
  },
] as const;

export const PRO_ALSO = [
  { title: 'Unlimited generated plans', body: '', icon: 'infinity' },
  {
    title: 'Hyper-local events',
    body: 'Karaoke, run clubs, open mics, movies on the lawn',
    icon: 'pin',
  },
  { title: 'VIP support', body: '', icon: 'star' },
] as const;

export const PRO_PRICE = '$9.99';

export const PRO_PRICE_INTERVAL = '/mo';

export const PRO_UPGRADE_LABEL = 'Upgrade to Pro';

export const FREE_COMPARE = [
  { included: false, label: 'Custom weekend plans, curated for you automatically' },
  { included: true, label: 'View plans together in real time' },
  { included: false, label: 'Ping notifications based off your interests' },
  { included: true, label: '5 generated plans' },
  { included: false, label: 'Hyper-local events' },
  { included: false, label: 'VIP support' },
] as const;

export const PRO_COMPARE = [
  { included: true, label: 'Custom weekend plans, curated for you automatically' },
  { included: true, label: 'View plans together in real time' },
  { included: true, label: 'Ping notifications based off your interests' },
  { included: true, label: 'Unlimited generated plans' },
  { included: true, label: 'Hyper-local events' },
  { included: true, label: 'VIP support' },
] as const;

export const PRO_CHECKOUT_PATH = '/pro-checkout';

export type ProMatrixMark = boolean | 'unlimited';

export const PRO_MATRIX: ReadonlyArray<{
  readonly feature: string;
  readonly free: ProMatrixMark;
  readonly pro: ProMatrixMark;
  readonly group: 'both' | 'pro';
}> = [
  { feature: 'Plan builder', free: true, pro: true, group: 'both' },
  { feature: 'Itinerary library', free: true, pro: true, group: 'both' },
  { feature: '5 plans a month', free: true, pro: 'unlimited', group: 'both' },
  {
    feature: 'Custom weekend plans curated and delivered for you automatically based on your interest',
    free: false,
    pro: true,
    group: 'pro',
  },
  { feature: 'View plans together in real time', free: true, pro: true, group: 'both' },
  {
    feature: 'Ping notifications based off your interest',
    free: false,
    pro: true,
    group: 'pro',
  },
  { feature: 'Unlimited amount of generated plan', free: false, pro: true, group: 'pro' },
  {
    feature: 'hyper local event (karaoke, run clubs, open mics, movies on the lawn)',
    free: false,
    pro: true,
    group: 'pro',
  },
  { feature: 'VIP support', free: false, pro: true, group: 'pro' },
];

export const PRO_COMPARISON: ReadonlyArray<readonly [string, string]> = [
  [
    'You ask for a plan',
    'Custom weekend plans curated and delivered for you automatically based on your interest',
  ],
  ['View plans together in real time', 'View plans together in real time'],
  ['You remember the time', 'Ping notifications based off your interest'],
  ['5 plans a month', 'Unlimited amount of generated plan'],
  ['Not included', 'hyper local event (karaoke, run clubs, open mics, movies on the lawn)'],
  ['Not included', 'VIP support'],
];

export function proSubline(priceLabel: string): string {
  return `Every Friday, Friday through Sunday from your interests. ${priceLabel}, cancel anytime.`;
}
