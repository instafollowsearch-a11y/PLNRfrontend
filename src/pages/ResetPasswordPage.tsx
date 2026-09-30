import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../lib/api';
import { firstApiError } from '../lib/apiErrorMessage';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const emailFromLink = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(emailFromLink);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isComplete = message !== null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!token) {
      setError('This reset link is invalid or has expired.');
      setLoading(false);

      return;
    }

    try {
      const response = await authApi.resetPassword(
        email.trim(),
        token,
        password,
        passwordConfirmation,
      );
      setMessage(response.message || 'Password updated. You can log in with the new password.');
    } catch (err) {
      setError(firstApiError(err, 'Unable to reset the password.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use at least 8 characters. This link works once."
      footer={<Link to="/login">Back to log in</Link>}
    >
      {isComplete ? (
        <p role="status">{message}</p>
      ) : (
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
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
            minLength={8}
          />
          {error ? <p className="error-text">{error}</p> : null}
          <Button label="Update password" type="submit" loading={loading} />
        </form>
      )}
    </AuthLayout>
  );
}
