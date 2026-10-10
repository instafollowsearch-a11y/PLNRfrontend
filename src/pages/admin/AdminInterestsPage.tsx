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
import type {
  InterestAccount,
  InterestAccountFilter,
  InterestAccountSummary,
  InterestScan,
  InterestSkipReason,
  PaginatedMeta,
} from '../../lib/accountApi';
import './admin.css';

const FILTERS: Array<{ id: InterestAccountFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'matched', label: 'Matched' },
  { id: 'unmatched', label: 'No event' },
  { id: 'skipped', label: 'Not ready' },
];

const EMPTY_SUMMARY: InterestAccountSummary = {
  accounts: 0,
  with_saved_interests: 0,
  ready: 0,
  matched: 0,
  unmatched: 0,
  skipped: 0,
  top_interests: [],
};

function formatWhen(value: string | null): string {
  if (!value) {
    return '—';
  }

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

function scanSummary(scan: InterestScan | null): string {
  if (!scan?.finished_at) {
    return 'No scan yet. Run one to compare saved interests with events in the next 7 days.';
  }

  const when = formatWhen(scan.finished_at);

  return `Last scan finished ${when}. Checked ${scan.users_checked} account${scan.users_checked === 1 ? '' : 's'}. Kept ${scan.matches_kept} match${scan.matches_kept === 1 ? '' : 'es'}. Skipped ${scan.users_skipped}.`;
}

function skipReasonLabel(reason: InterestSkipReason | null): string {
  if (reason === 'no_city') {
    return 'No city';
  }

  if (reason === 'no_interests') {
    return 'No saved interests';
  }

  if (reason === 'no_city_or_interests') {
    return 'No city or saved interests';
  }

  return '';
}

function statusLabel(account: InterestAccount): string {
  if (account.status === 'matched') {
    return 'Matched';
  }

  if (account.status === 'unmatched') {
    return 'No upcoming event';
  }

  return 'Not ready';
}

export function AdminInterestsPage() {
  const [accounts, setAccounts] = useState<InterestAccount[]>([]);
  const [summary, setSummary] = useState<InterestAccountSummary>(EMPTY_SUMMARY);
  const [scan, setScan] = useState<InterestScan | null>(null);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState<InterestAccountFilter>('all');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    void accountApi
      .listInterestAccounts(appliedSearch, page, status)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setAccounts(response.data.accounts);
        setSummary(response.data.summary);
        setScan(response.data.scan);
        setMeta(response.data.meta);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load interest accounts.');
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
  }, [page, appliedSearch, status, refreshKey]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  }

  function selectStatus(next: InterestAccountFilter) {
    setPage(1);
    setStatus(next);
  }

  async function handleScan() {
    setScanning(true);
    setError(null);

    try {
      await accountApi.runInterestScan();
      setRefreshKey((current) => current + 1);
    } catch {
      setError('Unable to scan interests.');
    } finally {
      setScanning(false);
    }
  }

  const summaryItems = [
    {
      label: 'Saved interests',
      value: summary.with_saved_interests,
      hint: 'Accounts that stored interests on their profile.',
    },
    {
      label: 'Ready',
      value: summary.ready,
      hint: 'Has a city and a saved interest, so a scan can look.',
    },
    {
      label: 'Matched',
      value: summary.matched,
      hint: 'An event in their city in the next 7 days fits a saved interest.',
    },
    {
      label: 'No event',
      value: summary.unmatched,
      hint: 'Ready, but nothing coming up in their city fit.',
    },
    {
      label: 'Not ready',
      value: summary.skipped,
      hint: 'Missing a city, saved interests, or both.',
    },
  ];

  const narrowed = appliedSearch.trim() !== '' || status !== 'all';

  return (
    <AppShell title="Interests" showBack backTo="/admin" contentWidth="wide">
      <div className="page-stack admin-page">
        <PageIntro
          eyebrow="Admin"
          title="Interests"
          subtitle="Saved interests, what people typed in a plan, and which upcoming events match."
        />
        <AdminNav />

        <div className="admin-interest-toolbar">
          <p className="admin-users__count">{scanSummary(scan)}</p>
          <Button label="Scan now" variant="secondary" loading={scanning} onClick={() => void handleScan()} />
        </div>

        <div className="admin-interest-summary" aria-label="Interest summary">
          {summaryItems.map((item) => (
            <div key={item.label} className="admin-interest-summary__item">
              <p className="admin-interest-summary__label">{item.label}</p>
              <p className="admin-interest-summary__value">{item.value}</p>
              <p className="admin-interest-summary__hint">{item.hint}</p>
            </div>
          ))}
        </div>

        {summary.top_interests.length > 0 ? (
          <div>
            <p className="admin-interest-card__hint">Most common saved interests. The number is how many accounts saved it.</p>
            <div className="admin-interest-top" aria-label="Common interests">
              {summary.top_interests.map((interest) => (
                <Badge key={interest.label} variant="accent">
                  {interest.label} · {interest.accounts}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <form className="admin-search" onSubmit={handleSearch}>
          <Input
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
          />
          <Button label="Search" type="submit" variant="secondary" icon={<Search size={16} />} />
        </form>

        <div className="admin-role-filters" role="tablist" aria-label="Filter accounts">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={status === item.id}
              className={`admin-role-filters__btn${status === item.id ? ' is-active' : ''}`}
              onClick={() => selectStatus(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingState /> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {!loading && !error && accounts.length === 0 ? (
          <EmptyState
            title={narrowed ? 'No accounts in this view' : 'No accounts yet'}
            description={
              narrowed
                ? 'Try another filter or a different name or email.'
                : 'Accounts show up here with their saved interests and any plan mentions.'
            }
          />
        ) : null}

        {!loading && !error && accounts.length > 0 ? (
          <div className="admin-interest-list">
            {accounts.map((account) => (
              <article key={account.id} className="admin-interest-card">
                <div className="admin-interest-card__identity">
                  <div>
                    <h2>{account.name}</h2>
                    <p className="admin-interest-card__email">{account.email}</p>
                    <p className="admin-interest-card__city">{account.city || 'No city'}</p>
                  </div>
                  <div className="admin-interest-card__meta">
                    <Badge variant={account.is_pro ? 'success' : 'muted'}>{account.is_pro ? 'Pro' : 'Free'}</Badge>
                    <Badge variant={account.status === 'matched' ? 'accent' : 'muted'}>{statusLabel(account)}</Badge>
                  </div>
                </div>

                {account.skip_reason ? (
                  <p className="admin-interest-card__reason">{skipReasonLabel(account.skip_reason)}</p>
                ) : null}

                <section>
                  <h3>Saved</h3>
                  <p className="admin-interest-card__hint">Stored on the account. The scan uses these.</p>
                  {account.saved_interests.length > 0 ? (
                    <div className="admin-interest-chips">
                      {account.saved_interests.map((interest) => (
                        <Badge key={interest}>{interest}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-interest-card__reason">None saved on the account.</p>
                  )}
                </section>

                <section>
                  <h3>From a plan</h3>
                  <p className="admin-interest-card__hint">Typed while making a plan. Not used in the scan.</p>
                  {account.plan_interests.length > 0 ? (
                    <ul className="admin-interest-mentions">
                      {account.plan_interests.map((mention) => (
                        <li key={`${mention.label}-${mention.created_at ?? ''}`}>
                          <strong>{mention.label}</strong>
                          <span>
                            {mention.plan_type ? ` · ${mention.plan_type}` : ''}
                            {mention.city ? ` · ${mention.city}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-interest-card__reason">No interest typed in a plan.</p>
                  )}
                </section>

                {account.weekend_interests.length > 0 ? (
                  <section>
                    <h3>Weekend picks</h3>
                    <p className="admin-interest-card__hint">Interests on their latest weekend recommendation.</p>
                    <div className="admin-interest-chips">
                      {account.weekend_interests.map((interest) => (
                        <Badge key={interest} variant="plan">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </section>
                ) : null}

                {account.matches.length > 0 ? (
                  <section>
                    <h3>Upcoming events</h3>
                    <p className="admin-interest-card__hint">Events in the next 7 days that fit a saved interest.</p>
                    <ul className="admin-interest-events">
                      {account.matches.map((match) => (
                        <li key={match.id}>
                          <Badge variant="accent">{match.matched_interest}</Badge>
                          {match.event?.url ? (
                            <a href={match.event.url} target="_blank" rel="noreferrer">
                              {match.event.title}
                            </a>
                          ) : (
                            <span>{match.event?.title || 'Event'}</span>
                          )}
                          <span>{formatWhen(match.event?.starts_at ?? null)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </article>
            ))}
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
