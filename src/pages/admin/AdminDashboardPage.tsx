import { ArrowRight, CalendarRange, Settings2, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { AdminNav } from '../../components/admin/AdminNav';
import { AppShell } from '../../components/layout/AppShell';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageIntro } from '../../components/ui/PageIntro';
import { accountApi } from '../../lib/api';
import type { AdminStats } from '../../lib/accountApi';
import { useAuth } from '../../contexts/AuthContext';
import './admin.css';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [freePlansPerDay, setFreePlansPerDay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([accountApi.getAdminStats(), accountApi.getAdminSettings()])
      .then(([statsResponse, settingsResponse]) => {
        setStats(statsResponse.data);
        const value = settingsResponse.data.settings.free_plans_per_day;
        setFreePlansPerDay(typeof value === 'number' ? value : 5);
      })
      .catch(() => setError('Unable to load admin stats.'))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <AppShell title="Admin" showBack backTo="/" contentWidth="wide">
      <div className="page-stack admin-page">
        <PageIntro
          title={firstName ? `${firstName}’s dashboard` : 'Admin dashboard'}
          subtitle="Overview of accounts, plan volume, and free daily limits."
        />
        <AdminNav />

        {loading ? <LoadingState /> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {stats ? (
          <div className="admin-stats" role="list">
            <div className="admin-stats__item" role="listitem">
              <div className="admin-stats__icon" aria-hidden>
                <Users size={16} />
              </div>
              <p className="admin-stats__label">Users</p>
              <p className="admin-stats__value">{stats.users_total}</p>
              <p className="admin-stats__hint">Registered accounts</p>
            </div>
            <div className="admin-stats__item" role="listitem">
              <div className="admin-stats__icon" aria-hidden>
                <Shield size={16} />
              </div>
              <p className="admin-stats__label">Admins</p>
              <p className="admin-stats__value">{stats.admins_total}</p>
              <p className="admin-stats__hint">Elevated access</p>
            </div>
            <div className="admin-stats__item" role="listitem">
              <div className="admin-stats__icon" aria-hidden>
                <CalendarRange size={16} />
              </div>
              <p className="admin-stats__label">Plans today</p>
              <p className="admin-stats__value">{stats.plan_sessions_today}</p>
              <p className="admin-stats__hint">Created in the last day</p>
            </div>
            <div className="admin-stats__item" role="listitem">
              <div className="admin-stats__icon" aria-hidden>
                <CalendarRange size={16} />
              </div>
              <p className="admin-stats__label">Plans total</p>
              <p className="admin-stats__value">{stats.plan_sessions_total}</p>
              <p className="admin-stats__hint">All-time sessions</p>
            </div>
          </div>
        ) : null}

        {!loading && !error ? (
          <section className="admin-quick" aria-label="Quick actions">
            <h2 className="admin-section-title">Quick actions</h2>
            <div className="admin-quick__grid">
              <Link to="/admin/users" className="admin-quick__card">
                <div>
                  <p className="admin-quick__label">Users</p>
                  <p className="admin-quick__copy">Search accounts and manage admin roles.</p>
                </div>
                <ArrowRight size={18} aria-hidden />
              </Link>
              <Link to="/admin/settings" className="admin-quick__card">
                <div>
                  <p className="admin-quick__label">
                    <Settings2 size={14} aria-hidden /> Plan limits
                  </p>
                  <p className="admin-quick__copy">
                    {freePlansPerDay == null
                      ? 'Adjust free plans per day.'
                      : `Currently ${freePlansPerDay} free plan${freePlansPerDay === 1 ? '' : 's'} per day.`}
                  </p>
                </div>
                <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
