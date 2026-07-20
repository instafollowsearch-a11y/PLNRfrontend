import type { PlanTypeSlug } from '../../constants/planFlowConfig';
import { parseDateNightAnswers, validateDateNightAnswers } from './dateNight';
import { parseNightOutAnswers, validateNightOutAnswers } from './nightOut';
import { parseRoadTripAnswers, validateRoadTripAnswers } from './roadTrip';
import { parseVacationAnswers, validateVacationAnswers } from './vacation';

export function parsePlanAnswers(planType: PlanTypeSlug, raw: Record<string, string>) {
  switch (planType) {
    case 'night_out':
      return parseNightOutAnswers(raw);
    case 'date_night':
      return parseDateNightAnswers(raw);
    case 'vacation':
      return parseVacationAnswers(raw);
    case 'road_trip':
      return parseRoadTripAnswers(raw);
  }
}

export function validatePlanAnswers(planType: PlanTypeSlug, answers: Record<string, unknown>): boolean {
  switch (planType) {
    case 'night_out':
      return validateNightOutAnswers(answers);
    case 'date_night':
      return validateDateNightAnswers(answers);
    case 'vacation':
      return validateVacationAnswers(answers);
    case 'road_trip':
      return validateRoadTripAnswers(answers);
  }
}

export * from './dateNight';
export * from './nightOut';
export * from './roadTrip';
export * from './vacation';
