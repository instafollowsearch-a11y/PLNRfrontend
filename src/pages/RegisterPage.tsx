import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import type { ApiError } from '../lib/apiTypes';

export function RegisterPage() {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/plans" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register(name.trim(), email.trim(), password, passwordConfirmation);
      navigate('/plans', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Save itineraries and track your night outs in one place."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="page-stack" onSubmit={(event) => void handleSubmit(event)}>
        <Input
          label="Name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          required
        />
        {error ? <p className="error-text">{error}</p> : null}
        <Button label="Create account" type="submit" loading={loading} />
      </form>
    </AuthLayout>
  );
}
