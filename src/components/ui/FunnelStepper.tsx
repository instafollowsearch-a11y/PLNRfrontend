import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import type { PlanTypeSlug } from '../../constants/planFlowConfig';
import { planTypeAccents } from '../../constants/theme';

import './FunnelStepper.css';

export type FunnelStep = 'questions' | 'suggestions' | 'confirm' | 'itinerary' | 'send';

const STEPS: Array<{ id: FunnelStep; label: string }> = [
  { id: 'questions', label: 'Ask' },
  { id: 'suggestions', label: 'Ideas' },
  { id: 'confirm', label: 'Pick' },
  { id: 'itinerary', label: 'Plan' },
  { id: 'send', label: 'Send' },
];

type FunnelStepperProps = {
  current: FunnelStep;
  planType?: PlanTypeSlug;
  sessionUuid?: string | null;
};

export function FunnelStepper({ current, planType, sessionUuid }: FunnelStepperProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);
  const accent = planType ? planTypeAccents[planType] : undefined;

  return (
    <nav
      className="funnel-stepper"
      aria-label="Plan progress"
      style={accent ? ({ '--funnel-accent': accent } as CSSProperties) : undefined}
    >
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const href =
          planType && sessionUuid && done
            ? stepPath(planType, step.id, sessionUuid)
            : null;

        const content = (
          <>
            <span className="funnel-stepper__dot" aria-hidden />
            <span className="funnel-stepper__label">{step.label}</span>
          </>
        );

        return (
          <div
            key={step.id}
            className={`funnel-stepper__step${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}
          >
            {href ? (
              <Link to={href} className="funnel-stepper__link">
                {content}
              </Link>
            ) : (
              <span className="funnel-stepper__link">{content}</span>
            )}
            {index < STEPS.length - 1 ? <span className="funnel-stepper__rail" aria-hidden /> : null}
          </div>
        );
      })}
    </nav>
  );
}

function stepPath(planType: PlanTypeSlug, step: FunnelStep, sessionUuid: string): string {
  const base =
    step === 'questions'
      ? `/plan/${planType}`
      : `/plan/${planType}/${step === 'suggestions' ? 'suggestions' : step}`;

  if (step === 'questions') {
    return base;
  }

  return `${base}?session=${encodeURIComponent(sessionUuid)}`;
}
