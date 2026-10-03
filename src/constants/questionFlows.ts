import {
  DATE_NIGHT_INTEREST_PRESETS,
  FOOD_PREFERENCE_PRESETS,
  NIGHT_OUT_INTEREST_PRESETS,
  ROAD_TRIP_INTEREST_PRESETS,
  ROAD_TRIP_STOP_PRESETS,
  VACATION_INTEREST_PRESETS,
} from '../lib/interestPresets';

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'date'
  | 'time'
  | 'date_range'
  | 'datetime_range'
  | 'location'
  | 'interests'
  | 'hotel_choices';

export type QuestionConfig = {
  key: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  options?: Array<{ value: string; label: string }>;
  interestOptions?: readonly string[];
  showIf?: (answers: Record<string, string>) => boolean;
};

export const GENDER_OPTIONS = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'prefer_not_to_answer', label: 'Prefer not to answer' },
] as const;

export const AGE_RANGE_OPTIONS = [
  { value: '18–24', label: '18–24' },
  { value: '25–34', label: '25–34' },
  { value: '35–44', label: '35–44' },
  { value: '45–54', label: '45–54' },
  { value: '55+', label: '55+' },
  { value: 'Mixed ages', label: 'Mixed ages' },
] as const;

export const ACTIVITY_MIX_OPTIONS = [
  { value: 'Mostly active days', label: 'Mostly active days' },
  { value: 'Mostly relax days', label: 'Mostly relax days' },
  { value: 'Active mornings, relax afternoons', label: 'Active mornings, relax afternoons' },
  { value: 'Active first half, relax second half', label: 'Active first half, relax second half' },
  { value: 'Balanced mix each day', label: 'Balanced mix each day' },
] as const;

export const NIGHT_OUT_QUESTIONS: QuestionConfig[] = [
  {
    key: 'city',
    label: 'What city are you in?',
    type: 'location',
    placeholder: 'Search for a city…',
    hint: 'Pick from suggestions or tap the map.',
  },
  {
    key: 'interests',
    label: 'What are your interests?',
    type: 'interests',
    interestOptions: NIGHT_OUT_INTEREST_PRESETS,
    placeholder: 'Add something unique…',
    hint: 'Tap a few picks, then add anything else we should know.',
  },
  {
    key: 'group_size',
    label: 'How many people are in your group?',
    type: 'number',
    placeholder: '4',
    min: 1,
    max: 30,
    step: 1,
  },
  {
    key: 'budget_per_person',
    label: 'Budget per person?',
    type: 'number',
    placeholder: '65',
    prefix: '$',
    min: 1,
    max: 1000,
    step: 5,
  },
  {
    key: 'dates',
    label: 'What date is your night out?',
    type: 'date',
    hint: 'Choose the day you want to go out.',
  },
  {
    key: 'start_time',
    label: 'What time do you want to start?',
    type: 'time',
    hint: 'When should the evening begin?',
  },
];

export const DATE_NIGHT_QUESTIONS: QuestionConfig[] = [
  {
    key: 'self_gender',
    label: 'How would you describe yourself?',
    type: 'select',
    options: [...GENDER_OPTIONS],
  },
  {
    key: 'partner_gender',
    label: 'How would you describe your significant other?',
    type: 'select',
    options: [...GENDER_OPTIONS],
  },
  {
    key: 'city',
    label: 'What city are you in?',
    type: 'location',
    placeholder: 'Search for a city…',
    hint: 'Pick from suggestions or tap the map.',
  },
  {
    key: 'timeframe',
    label: "When would you like your date night?",
    type: 'datetime_range',
    hint: 'Pick the day and your start and end times.',
  },
  {
    key: 'partner_interests',
    label: 'What are their interests?',
    type: 'interests',
    interestOptions: DATE_NIGHT_INTEREST_PRESETS,
    placeholder: 'Add something they love…',
    hint: 'Choose a few that fit them, or describe something custom.',
  },
  {
    key: 'budget',
    label: "What's the budget for the night?",
    type: 'number',
    placeholder: '200',
    prefix: '$',
    min: 1,
    max: 5000,
    step: 25,
  },
  {
    key: 'event_count',
    label: 'How many events do you want throughout the day?',
    type: 'number',
    placeholder: '3',
    min: 1,
    max: 10,
    step: 1,
  },
];

function needsHotelPick(answers: Record<string, string>): boolean {
  return answers.needs_hotel === 'Yes';
}

function alreadyBookedHotel(answers: Record<string, string>): boolean {
  return answers.needs_hotel === 'Already booked';
}

const HOTEL_STAY_QUESTIONS: QuestionConfig[] = [
  {
    key: 'needs_hotel',
    label: 'Do you need a hotel?',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
      { value: 'Already booked', label: 'Already booked' },
    ],
  },
  {
    key: 'hotel_pick',
    label: 'Hotels to look at',
    type: 'hotel_choices',
    hint: 'Pick one to plan around, or let PLNR suggest one. Booking stays on the hotel’s site.',
    showIf: needsHotelPick,
  },
  {
    key: 'hotel_location',
    label: 'Where is your hotel?',
    type: 'text',
    placeholder: 'Hotel name or address',
    showIf: alreadyBookedHotel,
  },
  {
    key: 'hotel_shuttle',
    label: 'Does the hotel have a shuttle?',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
      { value: 'Not sure', label: 'Not sure' },
    ],
    showIf: alreadyBookedHotel,
  },
];

const FLYING_QUESTION: QuestionConfig = {
  key: 'flying',
  label: 'Are you flying?',
  type: 'select',
  options: [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ],
};

export const VACATION_QUESTIONS: QuestionConfig[] = [
  {
    key: 'destination',
    label: 'Where are you going?',
    type: 'location',
    placeholder: 'Search for a destination…',
    hint: 'City, region, or country.',
  },
  {
    key: 'dates',
    label: 'What are your travel dates?',
    type: 'date_range',
    hint: 'Select your trip start and end dates.',
  },
  {
    key: 'arrival_time',
    label: 'What time are you arriving or want to arrive?',
    type: 'time',
    hint: 'Arrival time on the first day.',
  },
  {
    key: 'budget',
    label: 'What is the budget for the trip?',
    type: 'number',
    placeholder: '3000',
    prefix: '$',
    min: 100,
    max: 100000,
    step: 100,
  },
  {
    key: 'age_range',
    label: 'Age range of group?',
    type: 'select',
    options: [...AGE_RANGE_OPTIONS],
    hint: 'Pick the range that best fits your group.',
  },
  {
    key: 'interests',
    label: 'What are you interested in?',
    type: 'interests',
    interestOptions: VACATION_INTEREST_PRESETS,
    placeholder: 'Add your own…',
    hint: 'Pick favorites and add anything else for your trip.',
  },
  {
    key: 'group_size',
    label: 'How many people in the group?',
    type: 'number',
    placeholder: '2',
    min: 1,
    max: 20,
    step: 1,
  },
  {
    key: 'activity_mix',
    label: 'Which days do you want activities vs. relax?',
    type: 'select',
    options: [...ACTIVITY_MIX_OPTIONS],
    hint: 'Choose how you want to balance the trip.',
  },
  ...HOTEL_STAY_QUESTIONS,
  FLYING_QUESTION,
];

export const ROAD_TRIP_QUESTIONS: QuestionConfig[] = [
  {
    key: 'start_location',
    label: 'Where are you starting?',
    type: 'location',
    placeholder: 'Search starting point…',
    hint: 'City or address.',
  },
  {
    key: 'end_location',
    label: 'Where are you going?',
    type: 'location',
    placeholder: 'Search destination…',
    hint: 'City or address.',
  },
  {
    key: 'arrival_date',
    label: 'When do you want to arrive?',
    type: 'date',
    hint: 'Target arrival date.',
  },
  {
    key: 'departure_time',
    label: 'What time are you leaving?',
    type: 'time',
    hint: 'Departure time on travel day.',
  },
  {
    key: 'car_type',
    label: 'What type of car?',
    type: 'select',
    options: [
      { value: 'Sedan', label: 'Sedan' },
      { value: 'SUV', label: 'SUV' },
      { value: 'Truck', label: 'Truck' },
      { value: 'Van', label: 'Van' },
      { value: 'Electric', label: 'Electric' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    key: 'stop_preference',
    label: 'Go straight there or stop on the way?',
    type: 'select',
    options: [
      { value: 'straight', label: 'Go straight there' },
      { value: 'with_stops', label: 'Stop on the way' },
    ],
  },
  {
    key: 'stop_interests',
    label: 'What do you want to see along the way?',
    type: 'interests',
    interestOptions: ROAD_TRIP_STOP_PRESETS,
    placeholder: 'Add roadside must-sees…',
    hint: 'Select stop types you would enjoy between cities.',
    showIf: (answers) => answers.stop_preference === 'with_stops',
  },
  {
    key: 'interests',
    label: 'What are your interests?',
    type: 'interests',
    interestOptions: ROAD_TRIP_INTEREST_PRESETS,
    placeholder: 'Add your own…',
    hint: 'Pick a few themes for the road.',
  },
  {
    key: 'food_preferences',
    label: 'What type of food do you like?',
    type: 'interests',
    interestOptions: FOOD_PREFERENCE_PRESETS,
    placeholder: 'Any dietary notes or cravings…',
    hint: 'Tap cuisines you enjoy, then add custom preferences.',
  },
  {
    key: 'group_size',
    label: 'How many people are in the car?',
    type: 'number',
    placeholder: '4',
    min: 1,
    max: 8,
    step: 1,
  },
  ...HOTEL_STAY_QUESTIONS,
];
