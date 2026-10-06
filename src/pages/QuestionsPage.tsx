import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { QuestionFlow } from '../components/QuestionFlow';
import { AppShell } from '../components/layout/AppShell';
import { PlanLimitModal } from '../components/pro/PlanLimitModal';
import { EmptyState } from '../components/ui/EmptyState';
import { FunnelStepper } from '../components/ui/FunnelStepper';
import { planSessionApi } from '../lib/api';
import type { ApiError } from '../lib/apiTypes';
import { savePlanSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, parsePlanAnswers, usePlanTypeParam } from './HomePage';

function isPlanLimitMessage(message: string): boolean {
  const text = message.toLowerCase();

  return text.includes('upgrade to pro') || text.includes('monthly free plan limit') || text.includes('limit reached');
}

export function QuestionsPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const navigate = useNavigate();
  const config = planType ? getPlanFlowConfig(planType) : null;
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  if (!planType || !config) {
    return (
      <AppShell showBack backTo="/">
        <EmptyState title="Plan type not found" description="Choose a plan from the home page." />
      </AppShell>
    );
  }

  async function handleComplete(rawAnswers: Record<string, string>) {
    if (!planType) {
      return;
    }

    setError(null);
    const answers = parsePlanAnswers(planType, rawAnswers);

    try {
      const createResponse = await planSessionApi.createPlanSession(planType, answers);
      const sessionUuid = createResponse.data.plan_session.uuid;

      savePlanSessionUuid(sessionUuid);
      navigate(withSession(`/plan/${planType}/gathering`, sessionUuid));
    } catch (err) {
      const apiError = err as ApiError;
      const message = apiError.message || 'Unable to start this plan. Please try again.';

      if (isPlanLimitMessage(message)) {
        setIsUpgradeOpen(true);
        return;
      }

      setError(message);
      throw err;
    }
  }

  return (
    <AppShell title={config.title} showBack backTo="/">
      <FunnelStepper current="questions" planType={planType} />
      {error ? (
        <div className="page-stack" style={{ marginBottom: 'var(--spacing-md)' }}>
          <p className="error-text">{error}</p>
        </div>
      ) : null}
      <QuestionFlow
        questions={config.questions}
        submitLabel={config.submitLabel}
        onComplete={handleComplete}
      />
      {isUpgradeOpen ? <PlanLimitModal onClose={() => setIsUpgradeOpen(false)} /> : null}
    </AppShell>
  );
}
