import { useState } from 'react';

import { planShareApi } from '../../lib/api';
import type { ApiError } from '../../lib/apiTypes';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import './SharePlanModal.css';

type SharePlanModalProps = {
  sessionUuid: string;
  onClose: () => void;
  onSent?: (email: string) => void;
  returnPath?: string;
};

export function SharePlanModal({
  sessionUuid,
  onClose,
  onSent,
}: SharePlanModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      setError('Enter an email address.');

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await planShareApi.createPlanShare(sessionUuid, email.trim());
      setSent(true);
      onSent?.(email.trim());
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to send invite.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="share-plan-modal" role="presentation">
      <button type="button" className="share-plan-modal__scrim" aria-label="Close" onClick={onClose} />
      <div
        className="share-plan-modal__panel-wrap"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-plan-title"
      >
        <Card className="share-plan-modal__panel">
          <h2 id="share-plan-title" className="share-plan-modal__title">
            Share this plan
          </h2>

          {sent ? (
            <>
              <p className="share-plan-modal__lead">
                Invite sent to <strong>{email}</strong>. They can view the itinerary once they accept.
              </p>
              <Button label="Done" onClick={onClose} />
            </>
          ) : null}

          {!sent ? (
            <>
              <p className="share-plan-modal__lead">
                Send a view-only invite. They will see the itinerary but cannot edit the plan.
              </p>
              <Input
                label="Invitee email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              {error ? <p className="error-text">{error}</p> : null}
              <div className="share-plan-modal__actions">
                <Button label="Send invite" onClick={() => void handleSubmit()} loading={loading} />
                <Button label="Cancel" variant="ghost" onClick={onClose} />
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
