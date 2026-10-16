import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordField } from '../components/ui/PasswordField';
import { authApi } from '../lib/api';
import { firstApiError } from '../lib/apiErrorMessage';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const emailFromLink = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(emailFromLink);
  const [code, setCode] = useState(searchParams.get('token') ?? '');
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

    const token = code.trim();

    if (!token) {
      setError('Enter the 6-digit code from your email.');
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
      subtitle="Enter the 6-digit code from your email. It works once."
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
            label="Reset code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
          <PasswordField
            label="New password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            required
            minLength={8}
          />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
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
