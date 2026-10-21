import { useEffect, useState } from 'react';

import { billingApi, planShareApi } from '../../lib/api';
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
  const [phone, setPhone] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsNote, setSmsNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void billingApi
      .getBillingConfig()
      .then((response) => {
        if (!cancelled) {
          setSmsEnabled(response.data.plan_invite_sms_enabled === true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSmsEnabled(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit() {
    if (!email.trim()) {
      setError('Enter an email address.');

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const phoneToSend = smsEnabled ? phone.trim() || undefined : undefined;
      const response = await planShareApi.createPlanShare(sessionUuid, email.trim(), phoneToSend);
      setSmsNote(
        smsEnabled && phone.trim()
          ? response.data.share.sms_sent
            ? 'A text was sent too.'
            : 'The text could not be sent.'
          : null,
      );
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
            Send invitation
          </h2>

          {sent ? (
            <>
              <p className="share-plan-modal__lead">
                Invite sent to <strong>{email}</strong>. They can view the itinerary once they accept.
                {smsNote ? ` ${smsNote}` : ''}
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
              {smsEnabled ? (
                <Input
                  label="Mobile number (optional)"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+15551234567"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              ) : null}
              {error ? <p className="error-text">{error}</p> : null}
              <div className="share-plan-modal__actions">
                <Button label="Send invitation" onClick={() => void handleSubmit()} loading={loading} />
                <Button label="Cancel" variant="ghost" onClick={onClose} />
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
