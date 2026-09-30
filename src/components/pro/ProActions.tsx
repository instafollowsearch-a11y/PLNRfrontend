import { Crown, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PRO_UPGRADE_SUMMARY } from '../../constants/proBenefits';
import { useAuth } from '../../contexts/AuthContext';
import { billingApi } from '../../lib/api';
import type { ApiError, BillingConfig } from '../../lib/apiTypes';
import {
  billingPortalReturnUrl,
  billingReturnUrls,
  formatProPrice,
  parseBillingConfig,
} from '../../lib/billingHelpers';
import { Button } from '../ui/Button';
import './ProActions.css';

type ProActionsProps = {
  isPro: boolean;
  returnPath?: string;
};

function formatPeriodEnd(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProActions({ isPro, returnPath = '/plans' }: ProActionsProps) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void billingApi
      .getBillingConfig()
      .then((response) => setConfig(parseBillingConfig(response.data)))
      .catch(() => {
        // Optional — price label falls back.
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billing = params.get('billing');

    if (billing === 'portal') {
      setManageOpen(true);
      params.delete('billing');
      params.delete('fake');
      const next = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${next ? `?${next}` : ''}`);
    }

    if (billing === 'success') {
      setNotice('Welcome to Pro — your subscription is active.');
      void refreshUser();
      params.delete('billing');
      const next = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${next ? `?${next}` : ''}`);
    }
  }, [refreshUser]);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);

    try {
      const { successUrl, cancelUrl } = billingReturnUrls(returnPath);
      const response = await billingApi.createCheckoutSession(successUrl, cancelUrl);
      window.location.href = response.data.checkout_url;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to start checkout.');
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    setError(null);

    try {
      const response = await billingApi.createPortalSession(billingPortalReturnUrl(returnPath));

      if (response.data.fake) {
        setManageOpen(true);
        setLoading(false);

        return;
      }

      window.location.href = response.data.portal_url;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to open billing portal.');
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('Cancel your Pro subscription?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await billingApi.cancelSubscription();
      await refreshUser();
      setNotice('Pro canceled. You can upgrade again anytime.');
      setManageOpen(false);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to cancel subscription.');
    } finally {
      setLoading(false);
    }
  }

  const priceLabel = config
    ? `${formatProPrice(config.pro_monthly_price_cents, config.pro_currency)}/mo`
    : null;
  const periodEnd = formatPeriodEnd(user?.pro_current_period_end);
  const statusLabel = user?.pro_status?.replace(/_/g, ' ') ?? (isPro ? 'active' : 'inactive');

  return (
    <>
      <div className="pro-actions">
        <div className="pro-actions__copy">
          <div className="pro-actions__label">
            <Crown size={16} aria-hidden />
            <span>{isPro ? 'PLNR Pro' : 'Upgrade to Pro'}</span>
          </div>
          <p className="pro-actions__meta">
            {isPro
              ? periodEnd
                ? `Active through ${periodEnd}`
                : PRO_UPGRADE_SUMMARY
              : priceLabel
                ? `${PRO_UPGRADE_SUMMARY} ${priceLabel}.`
                : PRO_UPGRADE_SUMMARY}
          </p>
        </div>
        {isPro ? (
          <Button
            label="Manage Pro"
            variant="secondary"
            onClick={() => void handleManage()}
            loading={loading}
          />
        ) : (
          <Button label="Upgrade to Pro" onClick={() => void handleUpgrade()} loading={loading} />
        )}
      </div>

      {notice ? <p className="pro-actions__notice">{notice}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {manageOpen ? (
        <div className="pro-manage" role="dialog" aria-modal="true" aria-labelledby="pro-manage-title">
          <button
            type="button"
            className="pro-manage__scrim"
            aria-label="Close manage Pro"
            onClick={() => setManageOpen(false)}
          />
          <div className="pro-manage__panel">
            <header className="pro-manage__header">
              <h2 id="pro-manage-title">Manage Pro</h2>
              <button
                type="button"
                className="pro-manage__close"
                aria-label="Close"
                onClick={() => setManageOpen(false)}
              >
                <X size={18} aria-hidden />
              </button>
            </header>

            <dl className="pro-manage__details">
              <div>
                <dt>Status</dt>
                <dd className="pro-manage__status">{statusLabel}</dd>
              </div>
              {periodEnd ? (
                <div>
                  <dt>Current period ends</dt>
                  <dd>{periodEnd}</dd>
                </div>
              ) : null}
              {priceLabel ? (
                <div>
                  <dt>Price</dt>
                  <dd>{priceLabel}</dd>
                </div>
              ) : null}
            </dl>

            <p className="pro-manage__lead">
              Cancel anytime. With live Stripe configured, Manage Pro opens the Stripe customer portal
              for payment method updates.
            </p>

            {error ? <p className="error-text">{error}</p> : null}

            <div className="pro-manage__actions">
              <Button
                label="Cancel Pro"
                variant="secondary"
                onClick={() => void handleCancel()}
                loading={loading}
              />
              <Button label="Close" variant="ghost" onClick={() => setManageOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
