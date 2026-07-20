import { Minus, Plus } from 'lucide-react';

import './fields.css';

type NumberFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
};

export function NumberField({
  value,
  onChange,
  placeholder,
  min = 1,
  max = 100,
  step = 1,
  prefix,
}: NumberFieldProps) {
  const numeric = Number(value || min);

  function adjust(delta: number) {
    const next = Math.min(max, Math.max(min, numeric + delta));
    onChange(String(next));
  }

  return (
    <div className="number-field">
      <button type="button" className="number-field__step" onClick={() => adjust(-step)} aria-label="Decrease">
        <Minus size={16} />
      </button>
      <div className={`number-field__input-wrap ${prefix ? 'number-field__input-wrap--prefix' : ''}`}>
        {prefix ? <span className="number-field__prefix">{prefix}</span> : null}
        <input
          type="number"
          className="field-control number-field__input"
          value={value}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <button type="button" className="number-field__step" onClick={() => adjust(step)} aria-label="Increase">
        <Plus size={16} />
      </button>
    </div>
  );
}
