import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageIntro } from '../components/ui/PageIntro';
import { planTypeAccents } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { accountApi } from '../lib/api';
import type { PlanSession } from '../lib/apiTypes';
import { withSession } from '../lib/session';
import './MyPlansPage.css';

function planPath(session: PlanSession): string {
  const slug = session.plan_type?.slug ?? 'night_out';

  if (session.itinerary || session.status === 'itinerary' || session.status === 'completed') {
    return withSession(`/plan/${slug}/itinerary`, session.uuid);
  }

  if (session.status === 'selected') {
    return withSession(`/plan/${slug}/confirm`, session.uuid);
  }

  if (session.status === 'suggestions') {
    return withSession(`/plan/${slug}/suggestions`, session.uuid);
  }

  return withSession(`/plan/${slug}/gathering`, session.uuid);
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    gathering: 'Gathering',
    suggestions: 'Ideas ready',
    selected: 'Choice locked',
    itinerary: 'Itinerary',
    completed: 'Sent',
  };

  return map[status] ?? status.replace(/_/g, ' ');
}

function statusVariant(status: string): 'success' | 'accent' | 'muted' | 'default' {
  if (status === 'completed') {
    return 'success';
  }

  if (status === 'itinerary' || status === 'selected') {
    return 'accent';
  }

  if (status === 'draft' || status === 'gathering') {
    return 'muted';
  }

  return 'default';
}

function openLabel(status: string): string {
  if (status === 'completed' || status === 'itinerary') {
    return 'View';
  }

  if (status === 'suggestions' || status === 'selected') {
    return 'Continue';
  }

  return 'Open';
}

function formatPlanDate(value?: string): string {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MyPlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PlanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    void accountApi
      .listPlanSessions()
      .then((response) => setSessions(response.data.plan_sessions))
      .catch(() => setError('Unable to load your plans.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const sent = sessions.filter((session) => session.status === 'completed').length;
    const active = sessions.filter((session) => session.status !== 'completed').length;

    return { total: sessions.length, sent, active };
  }, [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter((session) => {
      if (filter === 'all') {
        return true;
      }

      if (filter === 'active') {
        return session.status !== 'completed';
      }

      if (filter === 'sent') {
        return session.status === 'completed';
      }

      return session.plan_type?.slug === filter;
    });
  }, [sessions, filter]);

  const filters = useMemo(() => {
    const typeSlugs = Array.from(
      new Set(sessions.map((session) => session.plan_type?.slug).filter(Boolean)),
    ) as string[];

    return [
      { id: 'all', label: 'All' },
      { id: 'active', label: 'In progress' },
      { id: 'sent', label: 'Sent' },
      ...typeSlugs.map((slug) => ({
        id: slug,
        label: sessions.find((session) => session.plan_type?.slug === slug)?.plan_type?.label ?? slug,
      })),
    ];
  }, [sessions]);

  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <AppShell title="My plans" showBack backTo="/">
      <div className="page-stack my-plans">
        <PageIntro
          title={firstName ? `${firstName}’s plans` : 'My plans'}
          subtitle="Track your night outs, date nights, and trips—pick up where you left off."
        />

        {loading ? <LoadingState message="Loading your plans…" /> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {!loading && !error && sessions.length > 0 ? (
          <div className="my-plans__summary" role="list">
            <div className="my-plans__summary-item" role="listitem">
              <span className="my-plans__summary-value">{stats.total}</span>
              <span className="my-plans__summary-label">Total</span>
            </div>
            <div className="my-plans__summary-item" role="listitem">
              <span className="my-plans__summary-value">{stats.active}</span>
              <span className="my-plans__summary-label">In progress</span>
            </div>
            <div className="my-plans__summary-item" role="listitem">
              <span className="my-plans__summary-value">{stats.sent}</span>
              <span className="my-plans__summary-label">Sent</span>
            </div>
          </div>
        ) : null}

        {!loading && !error && sessions.length > 0 ? (
          <div className="my-plans__filters" role="tablist" aria-label="Filter plans">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={`my-plans__filter${filter === item.id ? ' is-active' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        {!loading && !error && sessions.length === 0 ? (
          <EmptyState
            title="No plans yet"
            description="Start a free plan and it will show up here when you are signed in."
            action={<Button label="Start a new plan" onClick={() => navigate('/')} />}
          />
        ) : null}

        {!loading && sessions.length > 0 && filtered.length === 0 ? (
          <EmptyState
            title="Nothing in this filter"
            description="Try another filter or start a new plan."
            action={
              <Button label="Show all plans" variant="secondary" onClick={() => setFilter('all')} />
            }
          />
        ) : null}

        {!loading && filtered.length > 0 ? (
          <div className="my-plans__list">
            {filtered.map((session) => {
              const slug = session.plan_type?.slug ?? 'night_out';
              const accent = planTypeAccents[slug] ?? planTypeAccents.night_out;
              const href = planPath(session);

              return (
                <button
                  key={session.uuid}
                  type="button"
                  className="my-plans__card"
                  style={{ '--plan-accent': accent } as CSSProperties}
                  onClick={() => navigate(href)}
                >
                  <div className="my-plans__card-body">
                    <div className="my-plans__chips">
                      <Badge variant="plan" color={accent}>
                        {session.plan_type?.label ?? 'Plan'}
                      </Badge>
                      <Badge variant={statusVariant(session.status)}>{statusLabel(session.status)}</Badge>
                    </div>
                    <h2>{session.city || 'Untitled plan'}</h2>
                    <p className="my-plans__meta">
                      <span>
                        <MapPin size={13} aria-hidden />
                        {session.city || 'No city'}
                      </span>
                      <span>
                        <CalendarDays size={13} aria-hidden />
                        {formatPlanDate(session.created_at)}
                      </span>
                    </p>
                  </div>
                  <span className="my-plans__cta">
                    {openLabel(session.status)}
                    <ArrowRight size={16} aria-hidden />
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {!loading && sessions.length > 0 ? (
          <Button label="Start a new plan" onClick={() => navigate('/')} />
        ) : null}
      </div>
    </AppShell>
  );
}
