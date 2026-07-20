import type { PlanTypeSlug } from '../constants/planFlowConfig';
import { planTypeAccents } from '../constants/theme';
import type { Suggestion } from '../lib/apiTypes';

import './SuggestionCard.css';

type SuggestionCardProps = {
  suggestion: Suggestion;
  planType?: PlanTypeSlug;
  onSelect: (suggestion: Suggestion) => void;
  selectable?: boolean;
};

export function SuggestionCard({
  suggestion,
  planType,
  onSelect,
  selectable = true,
}: SuggestionCardProps) {
  const { payload } = suggestion;
  const accent = planType ? (planTypeAccents[planType] ?? 'var(--color-accent)') : 'var(--color-accent)';

  const content = (
    <>
      <h3 className="suggestion-card__title">{payload.name}</h3>
      <p className="suggestion-card__description">{payload.description}</p>

      {planType === 'night_out' && payload.estimated_cost_per_person != null ? (
        <p className="suggestion-card__meta">
          ${payload.estimated_cost_per_person} / person · {payload.time_slot}
        </p>
      ) : null}

      {planType === 'date_night' && payload.estimated_cost != null ? (
        <p className="suggestion-card__meta">
          ${payload.estimated_cost} total · {payload.time_slot}
        </p>
      ) : null}

      {planType === 'vacation' && payload.estimated_cost_total != null ? (
        <p className="suggestion-card__meta">${payload.estimated_cost_total} total trip estimate</p>
      ) : null}

      {planType === 'road_trip' ? (
        <div className="suggestion-card__road-trip">
          <div className="suggestion-card__chips">
            {payload.estimated_gas_cost != null ? (
              <span className="suggestion-card__chip">Gas ~${payload.estimated_gas_cost}</span>
            ) : null}
            {payload.estimated_food_cost != null ? (
              <span className="suggestion-card__chip">Food ~${payload.estimated_food_cost}</span>
            ) : null}
          </div>
          {payload.total_drive_time ? (
            <p className="suggestion-card__meta">Drive time: {payload.total_drive_time}</p>
          ) : null}
          {payload.stops?.map((stop, index) => (
            <p key={`${stop.name}-${index}`} className="suggestion-card__meta">
              {stop.name}
              {stop.closing_time ? ` · closes ${stop.closing_time}` : ''}
              {stop.duration ? ` · ${stop.duration}` : ''}
            </p>
          ))}
        </div>
      ) : null}

      {payload.venues?.length ? (
        <p className="suggestion-card__meta">{payload.venues.join(' · ')}</p>
      ) : null}

      {payload.highlights?.length ? (
        <p className="suggestion-card__meta">{payload.highlights.join(' · ')}</p>
      ) : null}

      {selectable ? (
        <p className="suggestion-card__cta" style={{ color: accent }}>
          Choose this plan
        </p>
      ) : null}
    </>
  );

  if (!selectable) {
    return (
      <article className="suggestion-card" style={{ borderLeftColor: accent }}>
        {content}
      </article>
    );
  }

  return (
    <button
      type="button"
      className="suggestion-card suggestion-card--clickable"
      style={{ borderLeftColor: accent }}
      onClick={() => onSelect(suggestion)}
    >
      {content}
    </button>
  );
}
