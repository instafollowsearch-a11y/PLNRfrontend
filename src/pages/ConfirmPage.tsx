import type { PlanTypeSlug } from '../constants/planFlowConfig';
import type { Suggestion } from '../lib/apiTypes';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { SuggestionCard } from '../components/SuggestionCard';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageIntro } from '../components/ui/PageIntro';
import { planSessionApi } from '../lib/api';
import { resolveSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, usePlanTypeParam } from './HomePage';

type LocationState = {
  suggestionId?: number;
};

export function ConfirmPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const [searchParams] = useSearchParams();
  const sessionUuid = resolveSessionUuid(searchParams);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const config = planType ? getPlanFlowConfig(planType) : null;

  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionUuid) {
      setLoading(false);

      return;
    }

    void planSessionApi
      .getPlanSession(sessionUuid)
      .then((response) => {
        const suggestions = response.data.plan_session.suggestions ?? [];
        const selected =
          suggestions.find((item) => item.id === state?.suggestionId) ?? suggestions[0] ?? null;

        setSuggestion(selected);
      })
      .finally(() => setLoading(false));
  }, [sessionUuid, state?.suggestionId]);

  async function handleConfirm() {
    if (!sessionUuid || !suggestion || !planType) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await planSessionApi.selectSuggestion(sessionUuid, suggestion.id);
      await planSessionApi.generateItinerary(sessionUuid);
      navigate(withSession(`/plan/${planType}/itinerary`, sessionUuid));
    } catch {
      setError('Unable to generate itinerary. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
      <AppShell title="Confirm" showBack backTo={`/plan/${planType}/suggestions`}>
        <EmptyState title="Session expired" />
      </AppShell>
    );
  }

  return (
    <AppShell title="Confirm itinerary" showBack backTo={withSession(`/plan/${planType}/suggestions`, sessionUuid)}>
      <PageIntro
        title="Ready to build your itinerary?"
        subtitle="We will turn this suggestion into a detailed plan you can email."
      />

      {loading ? <LoadingState /> : null}

      {!loading && suggestion ? (
        <SuggestionCard
          suggestion={suggestion}
          planType={planType as PlanTypeSlug}
          onSelect={() => undefined}
          selectable={false}
        />
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      {!loading ? (
        <Button label="Generate itinerary" onClick={() => void handleConfirm()} loading={submitting} />
      ) : null}
    </AppShell>
  );
}
