export type VacationAnswers = {
  destination: string;
  dates: string;
  budget: number;
  age_range: string;
  interests: string;
  group_size: number;
  activity_mix: string;
};

export function parseVacationAnswers(raw: Record<string, string>): VacationAnswers {
  return {
    destination: raw.destination?.trim() ?? '',
    dates: raw.dates?.trim() ?? '',
    budget: Number(raw.budget),
    age_range: raw.age_range?.trim() ?? '',
    interests: raw.interests?.trim() ?? '',
    group_size: Number(raw.group_size),
    activity_mix: raw.activity_mix?.trim() ?? '',
  };
}

export function validateVacationAnswers(answers: Record<string, unknown>): boolean {
  const typed = answers as VacationAnswers;

  return (
    typed.destination.length > 0 &&
    typed.dates.length > 0 &&
    Number.isFinite(typed.budget) &&
    typed.budget >= 1 &&
    typed.age_range.length > 0 &&
    typed.interests.length >= 3 &&
    Number.isFinite(typed.group_size) &&
    typed.group_size >= 1 &&
    typed.activity_mix.length >= 3
  );
}
