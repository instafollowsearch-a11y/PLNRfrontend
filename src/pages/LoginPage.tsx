import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import type { ApiError } from '../lib/apiTypes';
import { resolvePostAuthPath } from '../lib/postAuthPath';

export function LoginPage() {
  const { login, isAuthenticated, isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authLoading && isAuthenticated) {
    return <Navigate to={resolvePostAuthPath(user?.role ?? (isAdmin ? 'admin' : 'user'), from)} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedIn = await login(email.trim(), password);
      navigate(resolvePostAuthPath(loggedIn.role, from), { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to track your night outs and itineraries."
      footer={
        <>
          New here? <Link to="/register">Create an account</Link>
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
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? <p className="error-text">{error}</p> : null}
        <Button label="Log in" type="submit" loading={loading} />
      </form>
    </AuthLayout>
  );
}
