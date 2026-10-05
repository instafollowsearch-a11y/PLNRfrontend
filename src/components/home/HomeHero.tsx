import { Calendar, Gift, Sparkles } from 'lucide-react';

import './HomeHero.css';

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

export function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-hero__glow home-hero__glow--top" aria-hidden />
      <div className="home-hero__glow home-hero__glow--bottom" aria-hidden />

      <p className="home-hero__eyebrow">{getGreeting()}</p>
      <h2 className="home-hero__heading">Plan your next outing</h2>
      <p className="home-hero__subheading">
        Custom-made, curated plans instantly, based on your interests.
      </p>

      <div className="home-hero__pills">
        <span className="home-hero__pill">
          <Sparkles size={14} />
          Curated plans
        </span>
        <span className="home-hero__pill">
          <Gift size={14} />
          Free plans
        </span>
        <span className="home-hero__pill">
          <Calendar size={14} />
          Email delivery
        </span>
      </div>
    </section>
  );
}
