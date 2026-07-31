import type { CSSProperties, ReactNode } from 'react';

import './Badge.css';

type BadgeVariant = 'default' | 'accent' | 'success' | 'muted' | 'plan';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: string;
  className?: string;
};

export function Badge({ children, variant = 'default', color, className = '' }: BadgeProps) {
  return (
    <span
      className={`ui-badge ui-badge--${variant} ${className}`.trim()}
      style={color ? ({ '--badge-color': color } as CSSProperties) : undefined}
    >
      {children}
    </span>
  );
}
