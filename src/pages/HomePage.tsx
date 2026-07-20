import {
  getPlanFlowConfig,
  isPlanTypeSlug,
  type PlanTypeSlug,
} from '../constants/planFlowConfig';
import { parsePlanAnswers, validatePlanAnswers } from '../lib/planAnswers';

import { HowItWorks } from '../components/landing/HowItWorks';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingHero } from '../components/landing/LandingHero';
import { PlanTypeGrid } from '../components/landing/PlanTypeGrid';
import { TrustStrip } from '../components/landing/TrustStrip';
import '../components/landing/landing.css';
import { AppShell } from '../components/layout/AppShell';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function HomePage() {
  return (
    <AppShell variant="landing">
      <LandingHero
        onStartPlanning={() => scrollToId('plans')}
        onHowItWorks={() => scrollToId('how-it-works')}
      />
      <HowItWorks />
      <PlanTypeGrid />
      <TrustStrip />
      <LandingFooter />
    </AppShell>
  );
}

export function usePlanTypeParam(planType: string | undefined): PlanTypeSlug | null {
  if (!planType || !isPlanTypeSlug(planType)) {
    return null;
  }

  return planType;
}

export { getPlanFlowConfig, parsePlanAnswers, validatePlanAnswers };
