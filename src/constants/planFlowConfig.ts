import type { QuestionConfig } from './questionFlows';
import {
  DATE_NIGHT_QUESTIONS,
  NIGHT_OUT_QUESTIONS,
  ROAD_TRIP_QUESTIONS,
  VACATION_QUESTIONS,
} from './questionFlows';

export type PlanTypeSlug = 'night_out' | 'date_night' | 'vacation' | 'road_trip';

export type PlanFlowConfig = {
  slug: PlanTypeSlug;
  title: string;
  questions: QuestionConfig[];
};

export const PLAN_FLOW_CONFIG: Record<PlanTypeSlug, PlanFlowConfig> = {
  night_out: {
    slug: 'night_out',
    title: 'Plan My Night Out',
    questions: NIGHT_OUT_QUESTIONS,
  },
  date_night: {
    slug: 'date_night',
    title: 'Plan My Date Night',
    questions: DATE_NIGHT_QUESTIONS,
  },
  vacation: {
    slug: 'vacation',
    title: 'Plan My Vacation',
    questions: VACATION_QUESTIONS,
  },
  road_trip: {
    slug: 'road_trip',
    title: 'Plan My Road Trip',
    questions: ROAD_TRIP_QUESTIONS,
  },
};

export const PLAN_TYPE_SLUGS = Object.keys(PLAN_FLOW_CONFIG) as PlanTypeSlug[];

export function isPlanTypeSlug(value: string): value is PlanTypeSlug {
  return PLAN_TYPE_SLUGS.includes(value as PlanTypeSlug);
}

export function getPlanFlowConfig(planType: string): PlanFlowConfig | null {
  if (!isPlanTypeSlug(planType)) {
    return null;
  }

  return PLAN_FLOW_CONFIG[planType];
}
