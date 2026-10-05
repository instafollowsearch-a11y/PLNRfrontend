export type RoadTripAnswers = {
  start_location: string;
  end_location: string;
  departure_date: string;
  arrival_date: string;
  departure_time: string;
  car_type: string;
  stop_preference: 'straight' | 'with_stops';
  stop_interests?: string;
  interests: string;
  food_preferences: string;
  group_size: number;
  needs_hotel: string;
  hotel_pick?: string;
  hotel_location?: string;
  hotel_shuttle?: string;
};

export function parseRoadTripAnswers(raw: Record<string, string>): RoadTripAnswers {
  const stopPreference = raw.stop_preference === 'with_stops' ? 'with_stops' : 'straight';
  const needsHotel = raw.needs_hotel === 'Already booked';
  const wantsHotel = raw.needs_hotel === "I need a hotel";

  return {
    start_location: raw.start_location?.trim() ?? '',
    end_location: raw.end_location?.trim() ?? '',
    departure_date: raw.departure_date?.trim() ?? '',
    arrival_date: raw.arrival_date?.trim() ?? '',
    departure_time: raw.departure_time?.trim() ?? '',
    car_type: raw.car_type?.trim() ?? '',
    stop_preference: stopPreference,
    stop_interests:
      stopPreference === 'with_stops' ? raw.stop_interests?.trim() ?? '' : undefined,
    interests: raw.interests?.trim() ?? '',
    food_preferences: raw.food_preferences?.trim() ?? '',
    group_size: Number(raw.group_size),
    needs_hotel: raw.needs_hotel?.trim() ?? '',
    hotel_pick: wantsHotel ? raw.hotel_pick?.trim() ?? '' : undefined,
    hotel_location: needsHotel ? raw.hotel_location?.trim() ?? '' : undefined,
    hotel_shuttle: needsHotel ? raw.hotel_shuttle?.trim() ?? '' : undefined,
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
    typed.departure_date.length > 0 &&
    typed.arrival_date.length > 0 &&
    typed.departure_time.length > 0 &&
    typed.car_type.length > 0 &&
    (typed.stop_preference === 'straight' || typed.stop_preference === 'with_stops') &&
    stopInterestsValid &&
    typed.interests.length >= 3 &&
    typed.food_preferences.length >= 3 &&
    Number.isFinite(typed.group_size) &&
    typed.group_size >= 1 &&
    (typed.needs_hotel === "I need a hotel" ||
      typed.needs_hotel === "I don't need a hotel" ||
      typed.needs_hotel === 'Already booked') &&
    (typed.needs_hotel === "I don't need a hotel" ||
      (typed.needs_hotel === "I need a hotel" && (typed.hotel_pick?.length ?? 0) > 0) ||
      (typed.needs_hotel === 'Already booked' &&
        (typed.hotel_location?.length ?? 0) > 0 &&
        (typed.hotel_shuttle === 'Yes' || typed.hotel_shuttle === 'No' || typed.hotel_shuttle === 'Not sure')))
  );
}
