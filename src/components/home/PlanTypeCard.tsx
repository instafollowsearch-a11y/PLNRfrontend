import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Car, Heart, Moon, Plane } from 'lucide-react';

import './PlanTypeCard.css';

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  moon: Moon,
  plane: Plane,
  car: Car,
};

type PlanTypeCardProps = {
  label: string;
  description: string;
  accent: string;
  icon: string;
  onClick: () => void;
};

export function PlanTypeCard({ label, description, accent, icon, onClick }: PlanTypeCardProps) {
  const Icon = iconMap[icon] ?? Moon;

  return (
    <button type="button" className="plan-type-card" onClick={onClick}>
      <span className="plan-type-card__icon" style={{ backgroundColor: `${accent}18`, color: accent }}>
        <Icon size={24} />
      </span>

      <span className="plan-type-card__copy">
        <span className="plan-type-card__title">{label}</span>
        <span className="plan-type-card__description">{description}</span>
      </span>

      <span className="plan-type-card__action" style={{ backgroundColor: `${accent}14`, color: accent }}>
        <ArrowRight size={18} />
      </span>
    </button>
  );
}
