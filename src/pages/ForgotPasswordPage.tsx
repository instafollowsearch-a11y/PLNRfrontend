import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../lib/api';
import { firstApiError } from '../lib/apiErrorMessage';

const RESET_SENT = 'If an account exists for that email, we sent a 6-digit code.';

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await authApi.forgotPassword(email.trim());
      setMessage(response.message || RESET_SENT);
    } catch (err) {
      setError(firstApiError(err, 'Unable to send a reset code.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email on your account. We will send a 6-digit code if that account exists."
      footer={
        <Link to="/login">Back to log in</Link>
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
        {message ? (
          <p role="status">
            {message}{' '}
            <Link to={{ pathname: '/reset-password', search: email.trim() ? `?email=${encodeURIComponent(email.trim())}` : '' }}>
              Enter the code
            </Link>
          </p>
        ) : null}
        {error ? <p className="error-text">{error}</p> : null}
        <Button label="Send code" type="submit" loading={loading} />
      </form>
    </AuthLayout>
  );
}
