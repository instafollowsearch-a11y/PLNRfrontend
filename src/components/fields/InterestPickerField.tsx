import { Check, Plus, Sparkles } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import {
  buildInterestString,
  encodeInterestValue,
  parseInterestValue,
  type InterestValue,
} from '../../lib/interestPresets';

import './fields.css';
import './InterestPickerField.css';

type InterestPickerFieldProps = {
  value: string;
  presets: readonly string[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export function InterestPickerField({ value, presets, placeholder, onChange }: InterestPickerFieldProps) {
  const parsed = useMemo(() => parseInterestValue(value, presets), [value, presets]);
  const [draft, setDraft] = useState('');
  const customInputRef = useRef<HTMLInputElement>(null);

  function dismissKeyboard() {
    customInputRef.current?.blur();
  }

  function commit(next: InterestValue) {
    onChange(encodeInterestValue(next));
  }

  function togglePreset(option: string) {
    dismissKeyboard();
    const selected = parsed.selected.includes(option)
      ? parsed.selected.filter((item) => item !== option)
      : [...parsed.selected, option];

    commit({ ...parsed, selected });
  }

  function addCustom() {
    dismissKeyboard();
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    commit({
      selected: parsed.selected,
      custom: parsed.custom ? `${parsed.custom}, ${trimmed}` : trimmed,
    });
    setDraft('');
  }

  const summary = buildInterestString(parsed);

  return (
    <div className="interest-picker">
      <div className="interest-picker__section">
        <div className="interest-picker__section-head">
          <Sparkles size={16} />
          <span>Popular picks</span>
        </div>
        <div className="interest-picker__chips">
          {presets.map((option) => {
            const active = parsed.selected.includes(option);

            return (
              <button
                key={option}
                type="button"
                className={`interest-picker__chip ${active ? 'interest-picker__chip--active' : ''}`}
                onClick={() => togglePreset(option)}
                aria-pressed={active}
              >
                {active ? <Check size={14} /> : null}
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="interest-picker__section">
        <label className="interest-picker__section-head" htmlFor="interest-custom">
          <Plus size={16} />
          <span>Add your own</span>
        </label>
        <div className="interest-picker__custom-row">
          <input
            ref={customInputRef}
            id="interest-custom"
            type="text"
            className="field-control interest-picker__custom-input"
            placeholder={placeholder ?? 'Type something custom…'}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCustom();
              }
            }}
          />
          <button type="button" className="interest-picker__add-btn" onClick={addCustom}>
            Add
          </button>
        </div>
        {parsed.custom ? <p className="interest-picker__custom-note">Custom: {parsed.custom}</p> : null}
      </div>

      {summary ? (
        <div className="interest-picker__summary">
          <span className="interest-picker__summary-label">Your picks</span>
          <p>{summary}</p>
        </div>
      ) : (
        <p className="field-hint">Select at least one interest or add your own.</p>
      )}
    </div>
  );
}
