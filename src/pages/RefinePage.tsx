import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { RefinementChat } from '../components/RefinementChat';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { planSessionApi } from '../lib/api';
import { resolveSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, usePlanTypeParam } from './HomePage';

export function RefinePage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const [searchParams] = useSearchParams();
  const sessionUuid = resolveSessionUuid(searchParams);
  const navigate = useNavigate();
  const config = planType ? getPlanFlowConfig(planType) : null;

  const [messages, setMessages] = useState<Array<{ role: string; content: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionUuid) {
      setLoading(false);

      return;
    }

    void planSessionApi
      .getPlanSession(sessionUuid)
      .then((response) => {
        setMessages(response.data.plan_session.refinement_messages ?? []);
      })
      .finally(() => setLoading(false));
  }, [sessionUuid]);

  async function handleSubmit(message: string) {
    if (!sessionUuid || !planType) {
      return;
    }

    await planSessionApi.refinePlanSession(sessionUuid, message);
    navigate(withSession(`/plan/${planType}/suggestions`, sessionUuid));
  }

  if (!planType || !config) {
    return (
      <AppShell showBack backTo="/">
        <EmptyState title="Plan type not found" />
      </AppShell>
    );
  }

  if (!sessionUuid) {
    return (
      <AppShell title="Refine" showBack backTo={`/plan/${planType}/suggestions`}>
        <EmptyState title="Session expired" description="Start a new plan to continue." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Refine" showBack backTo={withSession(`/plan/${planType}/suggestions`, sessionUuid)}>
      {loading ? <LoadingState /> : <RefinementChat messages={messages} onSubmit={handleSubmit} />}
    </AppShell>
  );
}
