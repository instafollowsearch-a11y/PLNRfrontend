import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { QuestionFlow } from '../components/QuestionFlow';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/ui/EmptyState';
import { FunnelStepper } from '../components/ui/FunnelStepper';
import { planSessionApi } from '../lib/api';
import type { ApiError } from '../lib/apiTypes';
import { savePlanSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, parsePlanAnswers, usePlanTypeParam } from './HomePage';

export function QuestionsPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const navigate = useNavigate();
  const config = planType ? getPlanFlowConfig(planType) : null;
  const [error, setError] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState(false);

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
    setQuotaReached(false);
    const answers = parsePlanAnswers(planType, rawAnswers);

    try {
      const createResponse = await planSessionApi.createPlanSession(planType, answers);
      const sessionUuid = createResponse.data.plan_session.uuid;

      savePlanSessionUuid(sessionUuid);
      navigate(withSession(`/plan/${planType}/gathering`, sessionUuid));
    } catch (err) {
      const apiError = err as ApiError;
      const message = apiError.message || 'Unable to start this plan. Please try again.';
      const isQuota =
        message.toLowerCase().includes('daily free plan limit') ||
        message.toLowerCase().includes('limit reached');

      setQuotaReached(isQuota);
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
          {quotaReached ? (
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                Create an account
              </Link>{' '}
              for a separate daily limit, or try again tomorrow.
            </p>
          ) : null}
        </div>
      ) : null}
      <QuestionFlow questions={config.questions} onComplete={handleComplete} />
    </AppShell>
  );
}
