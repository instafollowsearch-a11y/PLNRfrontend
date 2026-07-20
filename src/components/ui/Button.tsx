import type { ButtonHTMLAttributes, ReactNode } from 'react';

import './Button.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
};

export function Button({
  label,
  loading = false,
  variant = 'primary',
  icon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`ui-button ui-button--${variant} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="ui-button__spinner" aria-hidden /> : icon}
      <span>{loading ? 'Please wait…' : label}</span>
    </button>
  );
}
