import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Car, Heart, Moon, Plane } from 'lucide-react';

import './PlanTypeLandingCard.css';

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  moon: Moon,
  plane: Plane,
  car: Car,
};

type PlanTypeLandingCardProps = {
  label: string;
  description: string;
  accent: string;
  icon: string;
  href: string;
  onClick: () => void;
};

export function PlanTypeLandingCard({
  label,
  description,
  accent,
  icon,
  href,
  onClick,
}: PlanTypeLandingCardProps) {
  const Icon = iconMap[icon] ?? Moon;

  return (
    <a
      href={href}
      className="plan-landing-card"
      style={{ '--plan-accent': accent } as CSSProperties}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      <span className="plan-landing-card__icon">
        <Icon size={28} />
      </span>
      <span className="plan-landing-card__copy">
        <span className="plan-landing-card__title">{label}</span>
        <span className="plan-landing-card__description">{description}</span>
      </span>
      <span className="plan-landing-card__action">
        Start
        <ArrowRight size={16} />
      </span>
    </a>
  );
}
