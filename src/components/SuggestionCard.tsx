import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Car, Clock, Flag, Heart, MapPin, Moon, Plane, Sparkles } from 'lucide-react';

import type { PlanTypeSlug } from '../constants/planFlowConfig';
import { planTypeAccents } from '../constants/theme';
import type { Suggestion } from '../lib/apiTypes';
import {
  type SuggestionChipKind,
  summarizeSuggestionCard,
} from '../lib/suggestionCardSummary';

import { Button } from './ui/Button';
import './SuggestionCard.css';

type SuggestionCardProps = {
  suggestion: Suggestion;
  planType?: PlanTypeSlug;
  onSelect: (suggestion: Suggestion) => void;
  selectable?: boolean;
  choosing?: boolean;
};

const PLAN_ICONS: Record<PlanTypeSlug, LucideIcon> = {
  date_night: Heart,
  night_out: Moon,
  vacation: Plane,
  road_trip: Car,
};

const CHIP_ICONS: Record<SuggestionChipKind, LucideIcon> = {
  time: Clock,
  drive: Car,
  stops: Flag,
  place: MapPin,
};

function softAccent(hex: string): string {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) {
    return 'var(--color-accent-soft)';
  }

  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
}

export function SuggestionCard({
  suggestion,
  planType,
  onSelect,
  selectable = true,
  choosing = false,
}: SuggestionCardProps) {
  const accent = planType ? (planTypeAccents[planType] ?? 'var(--color-accent)') : 'var(--color-accent)';
  const summary = summarizeSuggestionCard(suggestion.payload, planType);
  const PlanIcon = planType ? PLAN_ICONS[planType] : Sparkles;
  const wash = softAccent(typeof accent === 'string' ? accent : '#D4622A');

  return (
    <article
      className="suggestion-card"
      style={
        {
          '--suggestion-accent': accent,
          '--suggestion-wash': wash,
        } as CSSProperties
      }
    >
      <div className="suggestion-card__accent" aria-hidden />

      <div className="suggestion-card__header">
        <span className="suggestion-card__icon" aria-hidden>
          <PlanIcon size={16} strokeWidth={2.25} />
        </span>
        {summary.eyebrow ? <p className="suggestion-card__eyebrow">{summary.eyebrow}</p> : null}
      </div>

      <div className="suggestion-card__body">
        <h3 className="suggestion-card__title">{summary.title}</h3>

        {summary.hook ? <p className="suggestion-card__hook">{summary.hook}</p> : null}

        {summary.priceAmount ? (
          <div className="suggestion-card__price">
            <span className="suggestion-card__price-caption">About</span>
            <div className="suggestion-card__price-row">
              <span className="suggestion-card__price-amount">{summary.priceAmount}</span>
              {summary.priceSuffix ? (
                <span className="suggestion-card__price-suffix">{summary.priceSuffix}</span>
              ) : null}
            </div>
          </div>
        ) : null}

        {summary.chips.length > 0 ? (
          <div className="suggestion-card__chips">
            {summary.chips.map((chip, index) => {
              const ChipIcon = CHIP_ICONS[chip.kind];

              return (
                <span key={`${chip.label}-${index}`} className="suggestion-card__chip">
                  <ChipIcon size={13} strokeWidth={2.25} aria-hidden />
                  <span>{chip.label}</span>
                </span>
              );
            })}
          </div>
        ) : null}

        {selectable ? (
          <div className="suggestion-card__choose">
            <Button label="Pick plan" onClick={() => onSelect(suggestion)} loading={choosing} />
          </div>
        ) : null}

        <p className="suggestion-card__footnote">Full itinerary unlocks after you pick</p>
      </div>
    </article>
  );
}
