import type { CSSProperties, MouseEvent } from 'react';
import { ArrowRight, CalendarHeart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '../ui/Badge';
import './WeekendPicksEntry.css';

type WeekendPicksEntryProps = {
  onNavigate?: () => void;
};

export function WeekendPicksEntry({ onNavigate }: WeekendPicksEntryProps) {
  const navigate = useNavigate();

  function handleClick(event: MouseEvent) {
    event.preventDefault();
    onNavigate?.();
    navigate('/weekend');
  }

  return (
    <a
      href="/weekend"
      className="weekend-picks-entry"
      style={{ '--plan-accent': '#2d6a4f' } as CSSProperties}
      onClick={handleClick}
    >
      <span className="weekend-picks-entry__icon" aria-hidden>
        <CalendarHeart size={28} />
      </span>
      <span className="weekend-picks-entry__copy">
        <span className="weekend-picks-entry__title-row">
          <span className="weekend-picks-entry__title">Weekend picks</span>
          <Badge variant="accent">Pro</Badge>
        </span>
        <span className="weekend-picks-entry__description">
          AI-curated local events matched to your interests for the week ahead.
        </span>
      </span>
      <span className="weekend-picks-entry__action">
        Explore
        <ArrowRight size={16} />
      </span>
    </a>
  );
}
