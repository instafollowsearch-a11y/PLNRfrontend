import { Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { AdminNav } from '../../components/admin/AdminNav';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageIntro } from '../../components/ui/PageIntro';
import { accountApi } from '../../lib/api';
import type { AdminVisit, PaginatedMeta, VisitPlan } from '../../lib/accountApi';
import './admin.css';

type AudienceFilter = 'all' | 'signed_in' | 'guest';
type PlanFilter = 'all' | VisitPlan;

function planLabel(plan: VisitPlan): string {
  if (plan === 'pro') {
    return 'Pro';
  }

  if (plan === 'free') {
    return 'Free';
  }

  return 'Guest';
}

function planVariant(plan: VisitPlan): 'success' | 'muted' | 'accent' {
  if (plan === 'pro') {
    return 'success';
  }

  if (plan === 'guest') {
    return 'accent';
  }

  return 'muted';
}

function joinParts(parts: Array<string | null | undefined>): string {
  const text = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');

  return text || '—';
}

function formatWhen(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AdminVisitsPage() {
  const [visits, setVisits] = useState<AdminVisit[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [audience, setAudience] = useState<AudienceFilter>('all');
  const [plan, setPlan] = useState<PlanFilter>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    void accountApi
      .listVisits({
        page,
        search: appliedSearch,
        audience: audience === 'all' ? '' : audience,
        plan: plan === 'all' ? '' : plan,
      })
      .then((response) => {
        if (cancelled) {
          return;
        }

        setVisits(response.data.visits);
        setMeta(response.data.meta);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load visits.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, appliedSearch, audience, plan]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  }

  function selectAudience(next: AudienceFilter) {
    setPage(1);
    setAudience(next);
  }

  function selectPlan(next: PlanFilter) {
    setPage(1);
    setPlan(next);
  }

  return (
    <AppShell title="Visits" showBack backTo="/admin" contentWidth="wide">
      <div className="page-stack admin-page">
        <PageIntro
          eyebrow="Admin"
          title="Visits"
          subtitle="Page views on the website, with the browser, device, and whether the person was Free or Pro."
        />
        <AdminNav />

        <form className="admin-search" onSubmit={handleSearch}>
          <Input
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Page, name, or email"
          />
          <Button label="Search" type="submit" variant="secondary" icon={<Search size={16} />} />
        </form>

        <div className="admin-role-filters" role="tablist" aria-label="Filter by visitor">
          {(
            [
              { id: 'all', label: 'Everyone' },
              { id: 'signed_in', label: 'Signed in' },
              { id: 'guest', label: 'Guests' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={audience === item.id}
              className={`admin-role-filters__btn${audience === item.id ? ' is-active' : ''}`}
              onClick={() => selectAudience(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="admin-role-filters" role="tablist" aria-label="Filter by plan">
          {(
            [
              { id: 'all', label: 'All plans' },
              { id: 'pro', label: 'Pro' },
              { id: 'free', label: 'Free' },
              { id: 'guest', label: 'Guest' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={plan === item.id}
              className={`admin-role-filters__btn${plan === item.id ? ' is-active' : ''}`}
              onClick={() => selectPlan(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {!loading && !error && meta ? (
          <p className="admin-users__count">
            {meta.total} visit{meta.total === 1 ? '' : 's'}
          </p>
        ) : null}

        {loading ? <LoadingState /> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {!loading && !error && visits.length === 0 ? (
          <EmptyState
            title="No visits yet"
            description="Page views from the website show up here. Admin pages are left out."
          />
        ) : null}

        {!loading && !error && visits.length > 0 ? (
          <div className="admin-visits">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Person</th>
                  <th>Plan</th>
                  <th>Page</th>
                  <th>Browser</th>
                  <th>OS</th>
                  <th>Device</th>
                  <th>IP</th>
                  <th>Referrer</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{formatWhen(visit.occurred_at)}</td>
                    <td>
                      {visit.user ? (
                        <>
                          <strong>{visit.user.name}</strong>
                          <span className="admin-visits__sub">{visit.user.email}</span>
                        </>
                      ) : (
                        'Guest'
                      )}
                    </td>
                    <td>
                      <Badge variant={planVariant(visit.plan)}>{planLabel(visit.plan)}</Badge>
                    </td>
                    <td className="admin-visits__page">{visit.path}</td>
                    <td>{joinParts([visit.browser, visit.browser_version])}</td>
                    <td>{joinParts([visit.platform, visit.platform_version])}</td>
                    <td>
                      {visit.is_robot
                        ? 'Bot'
                        : joinParts([visit.device, visit.device_type === visit.device ? null : visit.device_type])}
                    </td>
                    <td>{visit.ip_address || '—'}</td>
                    <td className="admin-visits__page">{visit.referrer || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {meta && meta.last_page > 1 ? (
          <div className="admin-visits__pager">
            <Button
              label="Previous"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            />
            <p>
              Page {meta.current_page} of {meta.last_page}
            </p>
            <Button
              label="Next"
              variant="secondary"
              disabled={page >= meta.last_page}
              onClick={() => setPage((current) => current + 1)}
            />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
