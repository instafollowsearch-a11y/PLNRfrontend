import { Bell, CalendarDays, Check, Crown, Infinity, Users, X, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  PRO_BUTTON_LABEL,
  PRO_HEADLINE,
  PRO_MATRIX,
  PRO_QUOTES,
  type ProMatrixMark,
} from '../../constants/proBenefits';
import { useAuth } from '../../contexts/AuthContext';
import { checkoutErrorMessage } from '../../lib/billingHelpers';
import { startWebProCheckout } from '../../lib/startProCheckout';
import './HomeProSection.css';

const QUOTE_ICONS: Record<(typeof PRO_QUOTES)[number]['icon'], LucideIcon> = {
  calendar: CalendarDays,
  people: Users,
  bell: Bell,
};

export function HomeProSection() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGetPro() {
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
    <section id="plnr-pro" className="home-pro" aria-labelledby="home-pro-title">
      <p className="home-pro__eyebrow">
        <span className="home-pro__eyebrow-icon" aria-hidden="true">
          <Crown size={14} strokeWidth={2.25} />
        </span>
        PLNR Pro
      </p>
      <h2 id="home-pro-title" className="home-pro__title">
        {PRO_HEADLINE}
      </h2>
      <p className="home-pro__lead">Three things Pro puts in your pocket every week.</p>

      <div className="home-pro__quotes">
        {PRO_QUOTES.map((card, index) => {
          const Icon = QUOTE_ICONS[card.icon];
          return (
            <article key={card.title} className={`home-pro__quote home-pro__quote--${index + 1}`}>
              <span className="home-pro__quote-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={2.25} />
              </span>
              <p className="home-pro__quote-kicker">{card.title}</p>
              <p className="home-pro__quote-text">“{card.quote}”</p>
            </article>
          );
        })}
      </div>

      <div className="home-pro__matrix" role="table" aria-label="Free compared with Pro">
        <div className="home-pro__matrix-row home-pro__matrix-head" role="row">
          <span role="columnheader">What’s included</span>
          <span role="columnheader">Free</span>
          <span role="columnheader">Pro</span>
        </div>
        {PRO_MATRIX.map((row) => (
          <div key={row.feature} className="home-pro__matrix-row" role="row">
            <div role="cell" className="home-pro__feature">
              <span className="home-pro__feature-name">{row.feature}</span>
            </div>
            <Mark value={row.free} label={markLabel(row.feature, 'Free', row.free)} />
            <Mark value={row.pro} label={markLabel(row.feature, 'Pro', row.pro)} />
          </div>
        ))}
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      <button className="home-pro__cta" type="button" onClick={() => void handleGetPro()} disabled={isLoading}>
        {PRO_BUTTON_LABEL}
      </button>
    </section>
  );
}

function markLabel(feature: string, plan: string, value: ProMatrixMark): string {
  if (value === 'unlimited') {
    return `${feature} is unlimited on ${plan}`;
  }

  return value ? `${feature} is included on ${plan}` : `${feature} is not included on ${plan}`;
}

function Mark({ value, label }: { value: ProMatrixMark; label: string }) {
  const kind = value === 'unlimited' ? 'is-unlimited' : value ? 'is-yes' : 'is-no';

  return (
    <span role="cell" className="home-pro__mark-cell">
      <span className={`home-pro__mark ${kind}`} aria-label={label}>
        {value === 'unlimited' ? <Infinity size={16} strokeWidth={2.25} /> : value ? <Check size={15} strokeWidth={2.75} /> : <X size={15} strokeWidth={2.75} />}
      </span>
    </span>
  );
}
