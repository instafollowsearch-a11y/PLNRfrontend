import { useState, type FormEvent } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import type { ApiError } from '../../lib/apiTypes';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import './SendSignupModal.css';

type SendSignupModalProps = {
  initialEmail: string;
  onClose: () => void;
  onSignedUp: (email: string) => void | Promise<void>;
};

export function SendSignupModal({ initialEmail, onClose, onSignedUp }: SendSignupModalProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password || !passwordConfirmation) {
      setError('Fill in all fields to continue.');

      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(name.trim(), email.trim(), password, passwordConfirmation);
      await onSignedUp(email.trim());
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="send-signup-modal" role="presentation">
      <button
        type="button"
        className="send-signup-modal__scrim"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="send-signup-modal__panel-wrap"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-signup-title"
      >
        <Card className="send-signup-modal__panel">
          <h2 id="send-signup-title" className="send-signup-modal__title">
            Create your free account
          </h2>
          <p className="send-signup-modal__lead">
            Your itinerary stays right here. Sign up and we will email it to you.
          </p>

          <form className="send-signup-modal__form" onSubmit={(event) => void handleSubmit(event)}>
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

            <div className="send-signup-modal__actions">
              <Button label="Sign up & send" type="submit" loading={loading} />
              <Button label="Cancel" type="button" variant="ghost" onClick={onClose} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
