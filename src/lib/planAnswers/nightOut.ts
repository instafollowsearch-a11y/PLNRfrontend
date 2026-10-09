import { areaAnswersAreValid, parseAreaAnswers, type AreaAnswers } from './area';

export type NightOutAnswers = AreaAnswers & {
  city: string;
  interests: string;
  group_size: number;
  budget_per_person: number;
  dates: string;
  start_time: string;
};

export function parseNightOutAnswers(raw: Record<string, string>): NightOutAnswers {
  return {
    city: raw.city?.trim() ?? '',
    interests: raw.interests?.trim() ?? '',
    group_size: Number(raw.group_size),
    budget_per_person: Number(raw.budget_per_person),
    dates: raw.dates?.trim() ?? '',
    start_time: raw.start_time?.trim() ?? '',
    ...parseAreaAnswers(raw),
  };
}

export function validateNightOutAnswers(answers: Record<string, unknown>): boolean {
  const typed = answers as NightOutAnswers;

  return (
    typed.city.length > 0 &&
    typed.interests.length >= 3 &&
    Number.isFinite(typed.group_size) &&
    typed.group_size >= 1 &&
    Number.isFinite(typed.budget_per_person) &&
    typed.budget_per_person >= 1 &&
    typed.dates.length > 0 &&
    typed.start_time.length > 0 &&
    areaAnswersAreValid(typed)
  );
}
