import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordField } from '../components/ui/PasswordField';
import { useAuth } from '../contexts/AuthContext';
import { planShareApi } from '../lib/api';
import type { ApiError } from '../lib/apiTypes';
import { extractInviteToken, isInvitePath } from '../lib/inviteHelpers';
import { resolvePostAuthPath } from '../lib/postAuthPath';
import { withSession } from '../lib/session';
import { startWebProCheckout } from '../lib/startProCheckout';

export function LoginPage() {
  const { login, isAuthenticated, isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: string; proCheckout?: boolean } | null;
  const from = locationState?.from ?? null;
  const proCheckout = locationState?.proCheckout === true;
  const checkoutStarted = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !proCheckout || checkoutStarted.current) {
      return;
    }

    checkoutStarted.current = true;
    void startWebProCheckout().catch(() => {
      checkoutStarted.current = false;
      setError('Unable to start checkout. Try again.');
    });
  }, [authLoading, isAuthenticated, proCheckout]);

  if (!authLoading && isAuthenticated && !proCheckout) {
    return <Navigate to={resolvePostAuthPath(user?.role ?? (isAdmin ? 'admin' : 'user'), from)} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedIn = await login(email.trim(), password);

      if (isInvitePath(from)) {
        const token = extractInviteToken(from ?? '');

        if (token) {
          try {
            const response = await planShareApi.acceptPlanShare(token);
            const session = response.data.plan_session;
            const slug = session?.plan_type?.slug ?? 'night_out';

            if (session?.uuid) {
              navigate(withSession(`/plan/${slug}/itinerary`, session.uuid), { replace: true });

              return;
            }
          } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Logged in, but unable to accept invite.');
            navigate(resolvePostAuthPath(loggedIn.role, from), { replace: true });

            return;
          }
        }
      }

      if (proCheckout) {
        try {
          await startWebProCheckout();
        } catch {
          setError('Unable to start checkout. Try again.');
        }
        return;
      }

      navigate(resolvePostAuthPath(loggedIn.role, from), { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  }

  const registerState = {
    ...(from ? { from } : {}),
    ...(proCheckout ? { proCheckout: true } : {}),
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to track your night outs and itineraries."
      footer={
        <>
          New here?{' '}
          <Link to="/register" state={registerState}>
            Create an account
          </Link>
        </>
      }
    >
      <form className="page-stack" onSubmit={(event) => void handleSubmit(event)}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          required
        />
        <p className="auth-forgot">
          <Link to={{ pathname: '/forgot-password', search: email.trim() ? `?email=${encodeURIComponent(email.trim())}` : '' }}>
            Forgot password?
          </Link>
        </p>
        {error ? <p className="error-text">{error}</p> : null}
        <Button label="Log in" type="submit" loading={loading} />
      </form>
    </AuthLayout>
  );
}
