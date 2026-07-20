export type RoadTripAnswers = {
  start_location: string;
  end_location: string;
  arrival_date: string;
  departure_time: string;
  car_type: string;
  stop_preference: 'straight' | 'with_stops';
  stop_interests?: string;
  interests: string;
  food_preferences: string;
  group_size: number;
};

export function parseRoadTripAnswers(raw: Record<string, string>): RoadTripAnswers {
  const stopPreference = raw.stop_preference === 'with_stops' ? 'with_stops' : 'straight';

  return {
    start_location: raw.start_location?.trim() ?? '',
    end_location: raw.end_location?.trim() ?? '',
    arrival_date: raw.arrival_date?.trim() ?? '',
    departure_time: raw.departure_time?.trim() ?? '',
    car_type: raw.car_type?.trim() ?? '',
    stop_preference: stopPreference,
    stop_interests:
      stopPreference === 'with_stops' ? raw.stop_interests?.trim() ?? '' : undefined,
    interests: raw.interests?.trim() ?? '',
    food_preferences: raw.food_preferences?.trim() ?? '',
    group_size: Number(raw.group_size),
  };
}

export function validateRoadTripAnswers(answers: Record<string, unknown>): boolean {
  const typed = answers as RoadTripAnswers;

  const stopInterestsValid =
    typed.stop_preference === 'straight' ||
    (typed.stop_interests !== undefined && typed.stop_interests.length >= 3);

  return (
    typed.start_location.length > 0 &&
    typed.end_location.length > 0 &&
    typed.arrival_date.length > 0 &&
    typed.departure_time.length > 0 &&
    typed.car_type.length > 0 &&
    (typed.stop_preference === 'straight' || typed.stop_preference === 'with_stops') &&
    stopInterestsValid &&
    typed.interests.length >= 3 &&
    typed.food_preferences.length >= 3 &&
    Number.isFinite(typed.group_size) &&
    typed.group_size >= 1
  );
}
