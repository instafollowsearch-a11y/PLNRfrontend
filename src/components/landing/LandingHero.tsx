import { ArrowRight, Car, Heart, Moon, Plane, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import './LandingHero.css';

const HERO_TYPES = [
  { label: 'Date night', icon: Heart, href: '/plan/date_night', accent: '#C45C8A' },
  { label: 'Night out', icon: Moon, href: '/plan/night_out', accent: '#D4622A' },
  { label: 'Vacation', icon: Plane, href: '/plan/vacation', accent: '#3D8B7A' },
  { label: 'Road trip', icon: Car, href: '/plan/road_trip', accent: '#4A6FA5' },
] as const;

const MOCK_STOPS = [
  { time: '7:00 PM', venue: 'Rooftop cocktails', activity: 'Sunset drinks' },
  { time: '8:30 PM', venue: 'Blue Note Bar', activity: 'Live jazz set' },
  { time: '10:00 PM', venue: 'Taco truck row', activity: 'Late-night bites' },
];

type LandingHeroProps = {
  onStartPlanning: () => void;
  onHowItWorks: () => void;
};

export function LandingHero({ onStartPlanning, onHowItWorks }: LandingHeroProps) {
  return (
    <section className="landing-hero">
      <div className="landing-hero__glow landing-hero__glow--one" aria-hidden />
      <div className="landing-hero__glow landing-hero__glow--two" aria-hidden />

      <div className="landing-hero__inner">
        <div className="landing-hero__copy">
          <ul className="landing-hero__types">
            {HERO_TYPES.map(({ label, icon: Icon, href, accent }) => (
              <li key={label}>
                <Link
                  className="landing-hero__type"
                  to={href}
                  style={{ boxShadow: `0 6px 14px ${accent}38` }}
                >
                  <Icon size={14} aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="landing-hero__eyebrow">
            <Sparkles size={16} />
            Curated for you
          </p>
          <h1 className="landing-hero__headline">Plan unforgettable outings in minutes</h1>
          <p className="landing-hero__subhead">
            Custom-made, curated plans instantly, based on your interests.
          </p>

          <div className="landing-hero__actions">
            <button type="button" className="landing-hero__cta landing-hero__cta--primary" onClick={onStartPlanning}>
              Start planning free
              <ArrowRight size={18} />
            </button>
            <button type="button" className="landing-hero__cta landing-hero__cta--secondary" onClick={onHowItWorks}>
              See how it works
            </button>
          </div>
        </div>

        <div className="landing-hero__visual" aria-hidden>
          <div className="landing-hero__mock-card">
            <p className="landing-hero__mock-label">Your itinerary</p>
            <h2 className="landing-hero__mock-title">Saturday Night in Austin</h2>
            <ul className="landing-hero__mock-stops">
              {MOCK_STOPS.map((stop) => (
                <li key={stop.time}>
                  <span className="landing-hero__mock-time">{stop.time}</span>
                  <div>
                    <strong>{stop.venue}</strong>
                    <span>{stop.activity}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
