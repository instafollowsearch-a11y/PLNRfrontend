import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';

import { Input } from './Input';
import './PasswordField.css';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  error?: string | null;
  required?: boolean;
  minLength?: number;
  id?: string;
  name?: string;
};

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  error,
  required = false,
  minLength,
  id,
  name,
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isVisible, setIsVisible] = useState(false);

  function handleToggle() {
    setIsVisible((current) => !current);
  }

  return (
    <div className="password-field">
      <Input
        id={inputId}
        name={name}
        label={label}
        type={isVisible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        minLength={minLength}
        error={error}
      />
      <button
        type="button"
        className="password-field__toggle"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        aria-controls={inputId}
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleToggle}
      >
        {isVisible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
}
