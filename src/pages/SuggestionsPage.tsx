import type { PlanTypeSlug } from '../constants/planFlowConfig';
import type { Suggestion } from '../lib/apiTypes';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { SuggestionCard, type PlanDraftStatus } from '../components/SuggestionCard';
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
  const [failedIds, setFailedIds] = useState<number[]>([]);
  const [choosingId, setChoosingId] = useState<number | null>(null);
  const [chooseError, setChooseError] = useState<string | null>(null);
  const startedIds = useRef<Set<number>>(new Set());

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

  useEffect(() => {
    if (!sessionUuid) {
      return;
    }

    for (const suggestion of suggestions) {
      if (suggestion.itinerary_content || startedIds.current.has(suggestion.id)) {
        continue;
      }

      startedIds.current.add(suggestion.id);
      const suggestionId = suggestion.id;

      void planSessionApi
        .draftSuggestionPlan(sessionUuid, suggestionId)
        .then((response) => {
          const content = response.data.suggestion.itinerary_content;

          setSuggestions((current) =>
            current.map((item) =>
              item.id === suggestionId ? { ...item, itinerary_content: content } : item,
            ),
          );
          setFailedIds((current) => current.filter((id) => id !== suggestionId));
        })
        .catch(() => {
          setFailedIds((current) => (current.includes(suggestionId) ? current : [...current, suggestionId]));
        });
    }
  }, [sessionUuid, suggestions]);

  async function handleRetry() {
    if (!sessionUuid) {
      return;
    }

    setRetrying(true);
    setError(null);

    try {
      const response = await planSessionApi.generateSuggestions(sessionUuid);
      startedIds.current.clear();
      setFailedIds([]);
      setSuggestions(response.data.suggestions);
    } catch {
      setError('Unable to generate suggestions. Please try again.');
    } finally {
      setRetrying(false);
    }
  }

  function handleRetryPlan(suggestionId: number) {
    startedIds.current.delete(suggestionId);
    setFailedIds((current) => current.filter((id) => id !== suggestionId));
    setSuggestions((current) => current.map((item) => ({ ...item })));
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

  function planStatus(suggestion: Suggestion): PlanDraftStatus {
    if (suggestion.itinerary_content) {
      return 'ready';
    }

    if (failedIds.includes(suggestion.id)) {
      return 'failed';
    }

    return 'writing';
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

  const readyCount = suggestions.filter((suggestion) => suggestion.itinerary_content).length;

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

      {!loading && !error && suggestions.length > 0 ? (
        <p className="suggestions-progress">
          {readyCount} of {suggestions.length} plans ready.
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="suggestions-list">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              planType={planType as PlanTypeSlug}
              planStatus={planStatus(suggestion)}
              itinerary={suggestion.itinerary_content}
              onSelect={(item) => void handleSelect(item)}
              onRetry={() => handleRetryPlan(suggestion.id)}
              choosing={choosingId === suggestion.id}
            />
          ))}
        </div>
      ) : null}

      {chooseError ? <p className="error-text">{chooseError}</p> : null}

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
