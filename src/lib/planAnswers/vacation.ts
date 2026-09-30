export type VacationAnswers = {
  destination: string;
  dates: string;
  budget: number;
  age_range: string;
  interests: string;
  group_size: number;
  activity_mix: string;
  needs_hotel: string;
  hotel_location?: string;
  hotel_shuttle?: string;
  flying: string;
};

export function parseVacationAnswers(raw: Record<string, string>): VacationAnswers {
  const needsHotel = raw.needs_hotel === 'Yes' || raw.needs_hotel === 'Already booked';

  return {
    destination: raw.destination?.trim() ?? '',
    dates: raw.dates?.trim() ?? '',
    budget: Number(raw.budget),
    age_range: raw.age_range?.trim() ?? '',
    interests: raw.interests?.trim() ?? '',
    group_size: Number(raw.group_size),
    activity_mix: raw.activity_mix?.trim() ?? '',
    needs_hotel: raw.needs_hotel?.trim() ?? '',
    hotel_location: needsHotel ? raw.hotel_location?.trim() ?? '' : undefined,
    hotel_shuttle: needsHotel ? raw.hotel_shuttle?.trim() ?? '' : undefined,
    flying: raw.flying?.trim() ?? '',
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
    typed.activity_mix.length >= 3 &&
    (typed.needs_hotel === 'Yes' || typed.needs_hotel === 'No' || typed.needs_hotel === 'Already booked') &&
    (typed.needs_hotel === 'No' ||
      ((typed.hotel_location?.length ?? 0) > 0 &&
        (typed.hotel_shuttle === 'Yes' || typed.hotel_shuttle === 'No' || typed.hotel_shuttle === 'Not sure'))) &&
    (typed.flying === 'Yes' || typed.flying === 'No')
  );
}
