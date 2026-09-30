import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../lib/api';
import { firstApiError } from '../lib/apiErrorMessage';

const RESET_SENT = 'If an account exists for that email, we sent a reset link.';

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
      setError(firstApiError(err, 'Unable to send a reset link.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email on your account. We will send a link if that account exists."
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
        {message ? <p role="status">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        <Button label="Send reset link" type="submit" loading={loading} />
      </form>
    </AuthLayout>
  );
}
