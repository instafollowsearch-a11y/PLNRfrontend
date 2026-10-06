import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { checkoutErrorMessage } from '../../lib/billingHelpers';
import { startWebProCheckout } from '../../lib/startProCheckout';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import './PlanLimitModal.css';

type PlanLimitModalProps = {
  onClose: () => void;
};

export function PlanLimitModal({ onClose }: PlanLimitModalProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    if (!isAuthenticated) {
      navigate('/login', { state: { proCheckout: true } });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await startWebProCheckout();
    } catch (err) {
      setError(checkoutErrorMessage(err));
      setIsLoading(false);
    }
  }

  return (
    <div className="plan-limit-modal">
      <button type="button" className="plan-limit-modal__scrim" aria-label="Close" onClick={onClose} />
      <div
        className="plan-limit-modal__panel-wrap"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-limit-title"
      >
        <Card className="plan-limit-modal__panel">
          <p className="plan-limit-modal__eyebrow">PLNR Pro</p>
          <h2 id="plan-limit-title" className="plan-limit-modal__title">
            Upgrade to Pro
          </h2>
          <p className="plan-limit-modal__lead">
            You've used your free plans for this month. Upgrade to Pro to keep planning.
          </p>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="plan-limit-modal__actions">
            <Button label="Upgrade to Pro" onClick={() => void handleUpgrade()} loading={isLoading} />
            <Button label="Not now" variant="ghost" onClick={onClose} />
          </div>
        </Card>
      </div>
    </div>
  );
}
