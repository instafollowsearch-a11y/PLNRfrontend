import { Check, Crown, Image, Infinity, MapPin, Minus, Star } from 'lucide-react';
import { useState, type ReactNode } from 'react';
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

const WEEKEND_STOPS = [
  ['FRI', 'Open mic'],
  ['SAT', 'Run club'],
  ['SAT', 'Movies on the lawn'],
  ['SUN', 'Karaoke'],
] as const;

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
              <PhoneFrame>{phoneScreen(card.icon)}</PhoneFrame>
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

function phoneScreen(icon: (typeof PRO_QUOTES)[number]['icon']) {
  if (icon === 'people') {
    return <TogetherScreen />;
  }

  if (icon === 'bell') {
    return <PingScreen />;
  }

  return <WeekendScreen />;
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="pro-phone">
      <div className="pro-phone__bezel">
        <div className="pro-phone__screen">
          <span className="pro-phone__island" />
          {children}
        </div>
      </div>
    </div>
  );
}

function WeekendScreen() {
  return (
    <div className="pro-screen pro-screen--weekend">
      <div className="pro-screen__brand">
        <strong>PLNR</strong>
        <span className="pro-screen__avatar">D</span>
      </div>
      <p className="pro-screen__hello">Hello Donovan</p>
      <p className="pro-screen__sub">Here’s your weekend schedule</p>
      <ul className="pro-screen__days">
        {WEEKEND_STOPS.map(([day, name]) => (
          <li key={`${day}-${name}`}>
            <span>{day}</span>
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TogetherScreen() {
  return (
    <div className="pro-screen pro-screen--together">
      <p className="pro-screen__live">
        <span className="pro-screen__avatar pro-screen__avatar--live">D</span>
        <span className="pro-screen__live-dot" />
        Del is viewing this plan
      </p>
      <p className="pro-screen__hello">Your plan</p>
      <div className="pro-screen__timeline">
        <div className="pro-screen__stop">
          <span className="pro-screen__dot" />
          <div>
            <small>5:00 PM</small>
            <strong>Dinner</strong>
          </div>
        </div>
        <div className="pro-screen__stop pro-screen__stop--active">
          <span className="pro-screen__dot" />
          <div>
            <small>8:00 PM</small>
            <strong>Drinks</strong>
            <em>Del</em>
          </div>
        </div>
      </div>
    </div>
  );
}

function PingScreen() {
  return (
    <div className="pro-screen pro-screen--ping">
      <div className="pro-screen__notice">
        <span className="pro-screen__mark">P</span>
        <div>
          <p className="pro-screen__notice-meta">
            <strong>PLNR</strong>
            <span>now</span>
          </p>
          <p>Did you know this is happening today?</p>
        </div>
      </div>
      <p className="pro-screen__interest">Based off your interests</p>
      <div className="pro-screen__photo">
        <Image size={22} strokeWidth={1.75} />
        <span>[Group pilates photo]</span>
      </div>
      <p className="pro-screen__ping-title">Did you see group pilates happening on Wednesday?</p>
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
