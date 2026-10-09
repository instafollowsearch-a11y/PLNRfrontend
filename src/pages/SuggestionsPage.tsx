import type { PlanTypeSlug } from '../constants/planFlowConfig';
import type { Suggestion } from '../lib/apiTypes';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { RefinementChat } from '../components/RefinementChat';
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
  const [refinementMessages, setRefinementMessages] = useState<
    Array<{ role: string; content: string; created_at: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [choosingId, setChoosingId] = useState<number | null>(null);
  const [chooseError, setChooseError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionUuid) {
      setLoading(false);

      return;
    }

    void planSessionApi
      .getPlanSession(sessionUuid)
      .then((response) => {
        const planSession = response.data.plan_session;
        setSuggestions(planSession.suggestions ?? []);
        setRefinementMessages(planSession.refinement_messages ?? []);
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

  async function handleRefine(message: string) {
    if (!sessionUuid) {
      return;
    }

    const response = await planSessionApi.refinePlanSession(sessionUuid, message);
    setSuggestions(response.data.suggestions);
    setRefinementMessages(response.data.plan_session.refinement_messages ?? []);
  }

  async function handleSelect(suggestion: Suggestion) {
    if (!planType || !sessionUuid || choosingId !== null) {
      return;
    }

    setChoosingId(suggestion.id);
    setChooseError(null);

    try {
      await planSessionApi.selectSuggestion(sessionUuid, suggestion.id);
      await planSessionApi.generateItinerary(sessionUuid);
      navigate(withSession(`/plan/${planType}/itinerary`, sessionUuid));
    } catch {
      setChooseError('Unable to open this plan. Please try again.');
      setChoosingId(null);
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
      <AppShell title="Suggestions" showBack backTo={`/plan/${planType}`}>
        <EmptyState title="Session expired" description="Start a new plan to continue." />
      </AppShell>
    );
  }

  const suggestionList = (
    <>
      <div className="suggestions-list">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            planType={planType as PlanTypeSlug}
            onSelect={(item) => void handleSelect(item)}
            choosing={choosingId === suggestion.id}
          />
        ))}
      </div>
      {chooseError ? <p className="error-text">{chooseError}</p> : null}
    </>
  );

  return (
    <AppShell title="Suggestions" showBack backTo={`/plan/${planType}`}>
      <FunnelStepper current="suggestions" planType={planType} sessionUuid={sessionUuid} />
      <PageIntro
        title="Pick a plan"
        subtitle="Choose the one you’re interested in, and we’ll send you the complete curated plan."
      />

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

      {!loading && !error && suggestions.length > 0 ? (
        <RefinementChat messages={refinementMessages} onSubmit={handleRefine}>
          {suggestionList}
        </RefinementChat>
      ) : null}
    </AppShell>
  );
}
