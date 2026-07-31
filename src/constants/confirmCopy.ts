import type { PlanTypeSlug } from './planFlowConfig';

export const CONFIRM_SUBTITLES: Record<PlanTypeSlug, string> = {
  night_out: 'Generate your perfect night out.',
  date_night: 'Generate your perfect date night.',
  vacation: 'Generate your perfect vacation.',
  road_trip: 'Generate your perfect road trip.',
};

export function getConfirmSubtitle(planType: PlanTypeSlug): string {
  return CONFIRM_SUBTITLES[planType];
}
