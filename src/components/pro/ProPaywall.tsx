import { Crown, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { billingApi } from '../../lib/api';
import type { BillingConfig } from '../../lib/apiTypes';
import { billingReturnUrls, formatProPrice, parseBillingConfig } from '../../lib/billingHelpers';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LoadingState } from '../ui/LoadingState';
import './ProPaywall.css';

type ProPaywallProps = {
  title?: string;
  subtitle?: string;
  returnPath?: string;
  onRequireLogin?: () => void;
  isAuthenticated?: boolean;
};

export function ProPaywall({
  title = 'Upgrade to Pro',
  subtitle = 'Unlock weekend event picks, plan sharing, and more.',
  returnPath = '/weekend',
  onRequireLogin,
  isAuthenticated = true,
}: ProPaywallProps) {
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void billingApi
      .getBillingConfig()
      .then((response) => setConfig(parseBillingConfig(response.data)))
      .catch(() => setError('Unable to load Pro pricing.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade() {
    if (!isAuthenticated) {
      onRequireLogin?.();

      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const { successUrl, cancelUrl } = billingReturnUrls(returnPath);
      const response = await billingApi.createCheckoutSession(successUrl, cancelUrl);
      window.location.href = response.data.checkout_url;
    } catch {
      setError('Unable to start checkout. Try again.');
      setCheckoutLoading(false);
    }
  }

  const priceLabel =
    config !== null
      ? `${formatProPrice(config.pro_monthly_price_cents, config.pro_currency)}/mo`
      : null;

  return (
    <Card className="pro-paywall">
      <div className="pro-paywall__icon" aria-hidden>
        <Crown size={28} />
      </div>
      <p className="pro-paywall__eyebrow">
        <Sparkles size={14} />
        PLNR Pro
      </p>
      <h2 className="pro-paywall__title">{title}</h2>
      <p className="pro-paywall__subtitle">{subtitle}</p>

      <ul className="pro-paywall__features">
        <li>Curated weekend event picks for your city</li>
        <li>Share itineraries with friends and family</li>
        <li>Email your picks anytime</li>
      </ul>

      {loading ? <LoadingState message="Loading pricing…" /> : null}
      {priceLabel ? <p className="pro-paywall__price">{priceLabel}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <Button
        label={isAuthenticated ? 'Upgrade to Pro' : 'Log in to upgrade'}
        onClick={() => void handleUpgrade()}
        loading={checkoutLoading}
      />
    </Card>
  );
}
