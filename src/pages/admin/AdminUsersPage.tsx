import { Search, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { AdminNav } from '../../components/admin/AdminNav';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageIntro } from '../../components/ui/PageIntro';
import { accountApi } from '../../lib/api';
import type { User, UserRole } from '../../lib/apiTypes';
import './admin.css';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadUsers(nextSearch = search) {
    setLoading(true);
    setError(null);

    try {
      const response = await accountApi.listUsers(nextSearch);
      setUsers(response.data.users);
    } catch {
      setError('Unable to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers('');
  }, []);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    await loadUsers(search);
  }

  async function toggleRole(user: User) {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    setUpdatingId(user.id);
    setError(null);

    try {
      const response = await accountApi.updateUserRole(user.id, nextRole);
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? response.data.user : item)),
      );
    } catch {
      setError('Unable to update user role.');
    } finally {
      setUpdatingId(null);
    }
  }

  const visibleUsers = useMemo(() => {
    if (roleFilter === 'all') {
      return users;
    }

    return users.filter((user) => user.role === roleFilter);
  }, [users, roleFilter]);

  return (
    <AppShell title="Users" showBack backTo="/admin" contentWidth="wide">
      <div className="page-stack admin-page">
        <PageIntro title="Users" subtitle="Search accounts and manage admin access." />
        <AdminNav />

        <form className="admin-search" onSubmit={(event) => void handleSearch(event)}>
          <Input
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
          />
          <Button label="Search" type="submit" variant="secondary" icon={<Search size={16} />} />
        </form>

        <div className="admin-role-filters" role="tablist" aria-label="Filter by role">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'admin', label: 'Admins' },
              { id: 'user', label: 'Users' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={roleFilter === item.id}
              className={`admin-role-filters__btn${roleFilter === item.id ? ' is-active' : ''}`}
              onClick={() => setRoleFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {!loading && !error ? (
          <p className="admin-users__count">
            {visibleUsers.length} account{visibleUsers.length === 1 ? '' : 's'}
            {roleFilter !== 'all' ? ` · ${roleFilter}` : ''}
          </p>
        ) : null}

        {loading ? <LoadingState /> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {!loading && !error && visibleUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description={
              search.trim()
                ? 'Try a different name or email.'
                : 'No accounts match this role filter.'
            }
            action={
              roleFilter !== 'all' ? (
                <Button label="Show all roles" variant="secondary" onClick={() => setRoleFilter('all')} />
              ) : undefined
            }
          />
        ) : null}

        <div className="admin-users">
          {visibleUsers.map((user) => (
            <article key={user.id} className="admin-users__row">
              <div className="admin-users__identity">
                <div className="admin-users__avatar" aria-hidden>
                  {initials(user.name)}
                </div>
                <div>
                  <div className="admin-users__name-row">
                    <strong>{user.name}</strong>
                    <Badge variant={user.role === 'admin' ? 'accent' : 'muted'}>{user.role}</Badge>
                  </div>
                  <p>{user.email}</p>
                  {user.city ? (
                    <p className="admin-users__city">
                      <UserRound size={12} aria-hidden />
                      {user.city}
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                label={user.role === 'admin' ? 'Make user' : 'Make admin'}
                variant="secondary"
                loading={updatingId === user.id}
                onClick={() => void toggleRole(user)}
              />
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
