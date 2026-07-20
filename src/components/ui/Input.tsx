import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

import './Input.css';

type BaseProps = {
  label?: string;
  error?: string | null;
  multiline?: boolean;
};

type InputProps = BaseProps &
  (
    | (InputHTMLAttributes<HTMLInputElement> & { multiline?: false })
    | (TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true })
  );

export function Input({ label, error, className = '', id, multiline = false, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className={`ui-input ${className}`.trim()} htmlFor={inputId}>
      {label ? <span className="ui-input__label">{label}</span> : null}
      {multiline ? (
        <textarea
          id={inputId}
          className={`ui-input__field ${error ? 'ui-input__field--error' : ''}`}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          className={`ui-input__field ${error ? 'ui-input__field--error' : ''}`}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error ? <span className="ui-input__error">{error}</span> : null}
    </label>
  );
}
