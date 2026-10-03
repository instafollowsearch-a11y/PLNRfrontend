import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  PRO_BUTTON_LABEL,
  PRO_COMPARISON,
  PRO_FRIDAY_LINES,
  PRO_HEADLINE,
  PRO_PRICE_NOTE,
  PRO_SAMPLE_CARDS,
  proFridayTitle,
  proSubline,
} from '../../constants/proBenefits';
import { billingApi } from '../../lib/api';
import type { BillingConfig } from '../../lib/apiTypes';
import { billingReturnUrls, formatProPrice, parseBillingConfig } from '../../lib/billingHelpers';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import './ProPaywall.css';

const FALLBACK_PRICE_LABEL = `${formatProPrice(999, 'usd')}/mo`;

type ProPaywallProps = {
  title?: string;
  subtitle?: string;
  returnPath?: string;
  city?: string | null;
  onRequireLogin?: () => void;
  onCreateAccount?: () => void;
  isAuthenticated?: boolean;
};

export function ProPaywall({
  title = PRO_HEADLINE,
  subtitle,
  returnPath = '/weekend',
  city,
  onRequireLogin,
  onCreateAccount,
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
      .catch(() => setConfig(null))
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

  const priceLabel = loading
    ? FALLBACK_PRICE_LABEL
    : config !== null
      ? `${formatProPrice(config.pro_monthly_price_cents, config.pro_currency)}/mo`
      : FALLBACK_PRICE_LABEL;
  const resolvedSubtitle = subtitle ?? proSubline(priceLabel);

  return (
    <Card className="pro-paywall">
      <p className="pro-paywall__eyebrow">
        <Sparkles size={14} />
        PLNR Pro
      </p>
      <h2 className="pro-paywall__title">{title}</h2>
      <p className="pro-paywall__subtitle">{resolvedSubtitle}</p>

      <div className="pro-paywall__samples">
        <article className="pro-paywall__sample pro-paywall__sample--lead">
          <h3>{proFridayTitle(city)}</h3>
          <ul>
            {PRO_FRIDAY_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
        {PRO_SAMPLE_CARDS.map((card) => (
          <article key={card.title} className="pro-paywall__sample">
            <h3>{card.title}</h3>
            <ul>
              {card.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <table className="pro-paywall__compare">
        <thead>
          <tr>
            <th scope="col">Free</th>
            <th scope="col" className="is-pro">
              Pro
            </th>
          </tr>
        </thead>
        <tbody>
          {PRO_COMPARISON.map(([free, pro]) => (
            <tr key={free}>
              <td>{free}</td>
              <td className="is-pro">{pro}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pro-paywall__offer">
        <p className="pro-paywall__price">
          {priceLabel}
          <span className="pro-paywall__note">{PRO_PRICE_NOTE}</span>
        </p>
        {error ? <p className="error-text">{error}</p> : null}
        {isAuthenticated ? (
          <Button label={PRO_BUTTON_LABEL} onClick={() => void handleUpgrade()} loading={checkoutLoading} />
        ) : (
          <div className="pro-paywall__actions">
            <Button label="Create an account" onClick={() => onCreateAccount?.()} />
            <Button label="Log in" variant="secondary" onClick={() => onRequireLogin?.()} />
          </div>
        )}
      </div>
    </Card>
  );
}
