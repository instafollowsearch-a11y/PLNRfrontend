import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { ProPaywall } from '../components/pro/ProPaywall';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageIntro } from '../components/ui/PageIntro';
import { useAuth } from '../contexts/AuthContext';
import { interestMatchesApi } from '../lib/api';
import type { ApiError } from '../lib/apiTypes';
import type { InterestMatch } from '../lib/interestMatchesApi';
import './InterestPingsPage.css';

function formatEventDate(value: string | null): string {
  if (!value) {
    return 'Date TBD';
  }

  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function InterestPingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<InterestMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = user?.is_pro === true;

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await interestMatchesApi.listInterestMatches();
      setMatches(response.data?.matches ?? []);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message ?? 'Unable to load interest matches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPro) {
      void loadMatches();
    }
  }, [isPro, loadMatches]);

  if (authLoading) {
    return (
      <AppShell title="Interest pings" showBack backTo="/">
        <LoadingState message="Loading…" />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell title="Interest pings" showBack backTo="/">
        <ProPaywall
          returnPath="/interest-pings"
          isAuthenticated={false}
          onCreateAccount={() => navigate('/register', { state: { from: '/interest-pings' } })}
          onRequireLogin={() => navigate('/login', { state: { from: '/interest-pings' } })}
        />
      </AppShell>
    );
  }

  if (!isPro) {
    return (
      <AppShell title="Interest pings" showBack backTo="/">
        <ProPaywall returnPath="/interest-pings" isAuthenticated />
      </AppShell>
    );
  }

  return (
    <AppShell title="Interest pings" showBack backTo="/">
      <div className="interest-pings">
        <PageIntro
          title="For you"
          subtitle="Local events that match your interests. On your phone, we’ll nudge you the day before and the morning they happen."
        />

        <p className="interest-pings__hint">
          Also see <Link to="/weekend">Weekend picks</Link> for Friday–Sunday.
        </p>

        {loading ? <LoadingState message="Loading matches…" /> : null}
        {error ? <p className="interest-pings__error">{error}</p> : null}

        {!loading && !error && matches.length === 0 ? (
          <EmptyState
            title="No matches yet"
            description="Save a city and interests. We scan every day and nudge you the day before and the morning of matching events."
          />
        ) : null}

        <ul className="interest-pings__list">
          {matches.map((match) => {
            const event = match.event;
            const title = event?.title ?? 'Upcoming event';
            const url = event?.url?.trim() ?? '';

            return (
              <li key={match.id} className="interest-pings__card">
                <p className="interest-pings__interest">{match.matched_interest}</p>
                <h2 className="interest-pings__title">{title}</h2>
                <p className="interest-pings__meta">
                  {formatEventDate(event?.starts_at ?? null)}
                  {event?.city ? ` · ${event.city}` : ''}
                </p>
                {url ? (
                  <a className="interest-pings__link" href={url} target="_blank" rel="noreferrer">
                    Open event
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
