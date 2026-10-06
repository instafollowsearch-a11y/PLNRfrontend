import { Check, Crown, Infinity, MapPin, Minus, Star } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FREE_COMPARE,
  PRO_ALSO,
  PRO_COMPARE,
  PRO_HEADLINE,
  PRO_PRICE,
  PRO_PRICE_INTERVAL,
  PRO_QUOTES,
  PRO_UPGRADE_LABEL,
} from '../../constants/proBenefits';
import { useAuth } from '../../contexts/AuthContext';
import { checkoutErrorMessage } from '../../lib/billingHelpers';
import { startWebProCheckout } from '../../lib/startProCheckout';
import './HomeProSection.css';

const PHONE_SHOTS: Record<(typeof PRO_QUOTES)[number]['icon'], string> = {
  calendar: '/pro/weekend-picks.png',
  people: '/pro/shared-itinerary.png',
  bell: '/pro/weekend-notification.png',
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

      <div className="home-pro__showcases">
        {PRO_QUOTES.map((card, index) => (
          <article
            key={card.title}
            className={`home-pro__row${index % 2 === 1 ? ' home-pro__row--flip' : ''}`}
          >
            <div className="home-pro__copy">
              <span className="home-pro__index">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="home-pro__feature-title">{card.title}</h3>
              <p className="home-pro__feature-body">{card.body}</p>
            </div>
            <div className="home-pro__visual" aria-hidden="true">
              <PhoneFrame src={PHONE_SHOTS[card.icon]} tone={card.icon === 'bell' ? 'dark' : 'light'} />
            </div>
          </article>
        ))}
      </div>

      <div className="home-pro__also">
        <h3 className="home-pro__also-title">Also in Pro</h3>
        <div className="home-pro__also-grid">
          {PRO_ALSO.map((item) => {
            const Icon = ALSO_ICONS[item.icon];

            return (
              <article key={item.title} className="home-pro__also-card">
                <span className="home-pro__also-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={2.25} />
                </span>
                <div>
                  <h4 className="home-pro__also-name">{item.title}</h4>
                  {item.body ? <p className="home-pro__also-body">{item.body}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="home-pro__compare">
        <h3 className="home-pro__compare-title">Free vs Pro</h3>
        <div className="home-pro__compare-grid">
          <article className="home-pro__plan">
            <h4 className="home-pro__plan-name">Free</h4>
            <p className="home-pro__plan-price">$0</p>
            <CompareList items={FREE_COMPARE} />
          </article>
          <article className="home-pro__plan home-pro__plan--pro">
            <h4 className="home-pro__plan-name">Pro</h4>
            <p className="home-pro__plan-price">
              {PRO_PRICE}
              <span>{PRO_PRICE_INTERVAL}</span>
            </p>
            <button className="home-pro__cta" type="button" onClick={() => void handleGetPro()} disabled={isLoading}>
              {PRO_UPGRADE_LABEL}
            </button>
            {error ? <p className="error-text">{error}</p> : null}
            <CompareList items={PRO_COMPARE} />
          </article>
        </div>
      </div>
    </section>
  );
}

const ALSO_ICONS = {
  infinity: Infinity,
  pin: MapPin,
  star: Star,
} as const;

function PhoneFrame({ src, tone }: { src: string; tone: 'light' | 'dark' }) {
  return (
    <div className="pro-phone">
      <div className="pro-phone__bezel">
        <div className={`pro-phone__screen${tone === 'dark' ? ' pro-phone__screen--dark' : ''}`}>
          <div className="pro-phone__status">
            <span className="pro-phone__time">9:41</span>
            <span className="pro-phone__status-icons">
              <svg viewBox="0 0 16 12" aria-hidden="true">
                <rect x="0" y="7.2" width="2.6" height="4.8" rx="0.7" />
                <rect x="4.4" y="4.6" width="2.6" height="7.4" rx="0.7" />
                <rect x="8.8" y="2.2" width="2.6" height="9.8" rx="0.7" />
                <rect x="13.2" y="0" width="2.6" height="12" rx="0.7" />
              </svg>
              <svg viewBox="0 0 15 12" aria-hidden="true">
                <path d="M7.5 9.15a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
                <path d="M3.15 7.15a6 6 0 0 1 8.7 0" />
                <path d="M0.85 4.55a9.2 9.2 0 0 1 13.3 0" />
              </svg>
              <svg viewBox="0 0 25 12" aria-hidden="true">
                <rect x="0.7" y="0.7" width="20" height="10.6" rx="2.4" />
                <rect x="2.3" y="2.3" width="15.2" height="7.4" rx="1.1" />
                <path d="M21.6 3.7h1.1a1.2 1.2 0 0 1 1.2 1.2v2.2a1.2 1.2 0 0 1-1.2 1.2h-1.1" />
              </svg>
            </span>
          </div>
          <img className="pro-phone__shot" src={src} alt="" />
        </div>
      </div>
    </div>
  );
}

function CompareList({ items }: { items: ReadonlyArray<{ included: boolean; label: string }> }) {
  return (
    <ul className="home-pro__plan-list">
      {items.map((item) => (
        <li key={item.label} className={item.included ? 'is-included' : undefined}>
          <span className={`home-pro__plan-mark${item.included ? ' is-yes' : ''}`} aria-hidden="true">
            {item.included ? <Check size={16} strokeWidth={2.75} /> : <Minus size={16} strokeWidth={2.75} />}
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
