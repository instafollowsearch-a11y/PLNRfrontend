const GENDERS = ['man', 'woman', 'prefer_not_to_answer'] as const;

export type DateNightAnswers = {
  self_gender: string;
  partner_gender: string;
  city: string;
  timeframe: string;
  partner_interests: string;
  budget: number;
  event_count: number;
};

export function parseDateNightAnswers(raw: Record<string, string>): DateNightAnswers {
  return {
    self_gender: raw.self_gender ?? '',
    partner_gender: raw.partner_gender ?? '',
    city: raw.city?.trim() ?? '',
    timeframe: raw.timeframe?.trim() ?? '',
    partner_interests: raw.partner_interests?.trim() ?? '',
    budget: Number(raw.budget),
    event_count: Number(raw.event_count),
  };
}

export function validateDateNightAnswers(answers: Record<string, unknown>): boolean {
  const typed = answers as DateNightAnswers;

  return (
    GENDERS.includes(typed.self_gender as (typeof GENDERS)[number]) &&
    GENDERS.includes(typed.partner_gender as (typeof GENDERS)[number]) &&
    typed.city.length > 0 &&
    typed.timeframe.length > 0 &&
    typed.partner_interests.length >= 3 &&
    Number.isFinite(typed.budget) &&
    typed.budget >= 1 &&
    Number.isFinite(typed.event_count) &&
    typed.event_count >= 1 &&
    typed.event_count <= 10
  );
}
