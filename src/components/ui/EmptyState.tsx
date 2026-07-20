import type { ReactNode } from 'react';

import './EmptyState.css';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}
