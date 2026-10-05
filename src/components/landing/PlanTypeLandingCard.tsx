import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Car, Heart, Moon, Plane } from 'lucide-react';

import dateNightPhoto from '../../assets/plans/date-night.webp';
import nightOutPhoto from '../../assets/plans/night-out.webp';
import roadTripPhoto from '../../assets/plans/road-trip.webp';
import vacationPhoto from '../../assets/plans/vacation.webp';
import './PlanTypeLandingCard.css';

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  moon: Moon,
  plane: Plane,
  car: Car,
};

const PLAN_PHOTOS: Record<string, { src: string; position: string }> = {
  date_night: { src: dateNightPhoto, position: 'center 58%' },
  night_out: { src: nightOutPhoto, position: 'center 40%' },
  vacation: { src: vacationPhoto, position: 'center 46%' },
  road_trip: { src: roadTripPhoto, position: 'center 70%' },
};

type PlanTypeLandingCardProps = {
  slug: string;
  label: string;
  description: string;
  accent: string;
  icon: string;
  href: string;
  imageUrl?: string | null;
  onClick: () => void;
};

export function PlanTypeLandingCard({
  slug,
  label,
  description,
  accent,
  icon,
  href,
  imageUrl,
  onClick,
}: PlanTypeLandingCardProps) {
  const Icon = iconMap[icon] ?? Moon;
  const bundled = PLAN_PHOTOS[slug];
  const photoSrc = imageUrl || bundled?.src;
  const photoPosition = imageUrl ? 'center' : bundled?.position;

  return (
    <a
      href={href}
      className="plan-landing-card"
      style={
        {
          '--plan-accent': accent,
          '--plan-photo-position': photoPosition ?? 'center',
        } as CSSProperties
      }
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {photoSrc ? (
        <span className="plan-landing-card__photo">
          <img
            src={photoSrc}
            alt=""
            width={880}
            height={587}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </span>
      ) : null}
      <span className="plan-landing-card__body">
        <span className="plan-landing-card__icon" aria-hidden>
          <Icon size={26} />
        </span>
        <span className="plan-landing-card__copy">
          <span className="plan-landing-card__title">{label}</span>
          <span className="plan-landing-card__description">{description}</span>
        </span>
        <span className="plan-landing-card__action">
          Start
          <ArrowRight size={16} aria-hidden />
        </span>
      </span>
    </a>
  );
}
