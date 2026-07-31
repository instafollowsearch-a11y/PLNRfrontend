import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { planSessionApi } from '../lib/api';
import { resolveSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, usePlanTypeParam } from './HomePage';
import './GatheringPage.css';

export function GatheringPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const [searchParams] = useSearchParams();
  const sessionUuid = resolveSessionUuid(searchParams);
  const navigate = useNavigate();
  const config = planType ? getPlanFlowConfig(planType) : null;
  const startedRef = useRef(false);

  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  async function generate(uuid: string, type: string) {
    setError(null);
    setRetrying(true);

    try {
      await planSessionApi.generateSuggestions(uuid);
      navigate(withSession(`/plan/${type}/suggestions`, uuid), { replace: true });
    } catch {
      setError('Unable to gather results. Please try again.');
      setRetrying(false);
    }
  }

  useEffect(() => {
    if (!sessionUuid || !planType || startedRef.current) {
      return;
    }

    startedRef.current = true;
    void generate(sessionUuid, planType);
  }, [sessionUuid, planType]);

  if (!planType || !config) {
    return (
      <AppShell showBack backTo="/">
        <EmptyState title="Plan type not found" />
      </AppShell>
    );
  }

  if (!sessionUuid) {
    return (
      <AppShell title="Gathering results" showBack backTo={`/plan/${planType}`}>
        <EmptyState title="Session expired" description="Start a new plan from the home page." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Gathering results" showBack backTo={`/plan/${planType}`}>
      <div className="gathering-page">
        {!error ? (
          <LoadingState
            variant="gathering"
            message="Gathering results"
            subtitle="Finding ideas that match your answers…"
          />
        ) : (
          <div className="gathering-page__error">
            <EmptyState title="Something went wrong" description={error} />
            <Button
              label="Try again"
              loading={retrying}
              onClick={() => {
                startedRef.current = false;
                void generate(sessionUuid, planType);
              }}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
