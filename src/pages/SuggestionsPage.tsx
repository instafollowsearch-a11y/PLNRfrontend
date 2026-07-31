import type { PlanTypeSlug } from '../constants/planFlowConfig';
import type { Suggestion } from '../lib/apiTypes';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { SuggestionCard } from '../components/SuggestionCard';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FunnelStepper } from '../components/ui/FunnelStepper';
import { LoadingState } from '../components/ui/LoadingState';
import { PageIntro } from '../components/ui/PageIntro';
import { planSessionApi } from '../lib/api';
import { resolveSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, usePlanTypeParam } from './HomePage';
import './SuggestionsPage.css';

export function SuggestionsPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const [searchParams] = useSearchParams();
  const sessionUuid = resolveSessionUuid(searchParams);
  const navigate = useNavigate();
  const config = planType ? getPlanFlowConfig(planType) : null;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!sessionUuid) {
      setLoading(false);

      return;
    }

    void planSessionApi
      .getPlanSession(sessionUuid)
      .then((response) => {
        setSuggestions(response.data.plan_session.suggestions ?? []);
      })
      .catch(() => setError('Unable to load suggestions.'))
      .finally(() => setLoading(false));
  }, [sessionUuid]);

  async function handleRetry() {
    if (!sessionUuid) {
      return;
    }

    setRetrying(true);
    setError(null);

    try {
      const response = await planSessionApi.generateSuggestions(sessionUuid);
      setSuggestions(response.data.suggestions);
    } catch {
      setError('Unable to generate suggestions. Please try again.');
    } finally {
      setRetrying(false);
    }
  }

  function handleSelect(suggestion: Suggestion) {
    if (!planType || !sessionUuid) {
      return;
    }

    navigate(withSession(`/plan/${planType}/confirm`, sessionUuid), {
      state: { suggestionId: suggestion.id },
    });
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
      <AppShell title="Suggestions" showBack backTo={`/plan/${planType}`}>
        <EmptyState title="Session expired" description="Start a new plan to continue." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Suggestions" showBack backTo={`/plan/${planType}`}>
      <FunnelStepper current="suggestions" planType={planType} sessionUuid={sessionUuid} />
      <PageIntro title="Pick an idea" subtitle="Tap a suggestion that fits the vibe you want." />

      {loading ? <LoadingState message="Loading suggestions…" /> : null}

      {!loading && error ? (
        <EmptyState
          title="Something went wrong"
          description={error}
          action={<Button label="Try again" onClick={() => void handleRetry()} loading={retrying} />}
        />
      ) : null}

      {!loading && !error && suggestions.length === 0 ? (
        <EmptyState
          title="No suggestions yet"
          description="Generate suggestions to see options."
          action={<Button label="Generate suggestions" onClick={() => void handleRetry()} loading={retrying} />}
        />
      ) : null}

      {!loading && !error ? (
        <div className="suggestions-list">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              planType={planType as PlanTypeSlug}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : null}

      {!loading && !error ? (
        <Button
          label="Something else instead"
          variant="secondary"
          onClick={() => navigate(withSession(`/plan/${planType}/refine`, sessionUuid))}
        />
      ) : null}
    </AppShell>
  );
}
