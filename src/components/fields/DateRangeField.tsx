import type { DateRangeValue } from '../../lib/fieldValues';

import { DateField } from './DateField';
import './fields.css';

type DateRangeFieldProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
};

export function DateRangeField({ value, onChange }: DateRangeFieldProps) {
  return (
    <div className="field-range">
      <label className="field-range__item">
        <span className="field-range__label">Start date</span>
        <DateField
          value={value.start}
          onChange={(start) => onChange({ ...value, start, end: value.end && value.end < start ? start : value.end })}
        />
      </label>
      <label className="field-range__item">
        <span className="field-range__label">End date</span>
        <DateField value={value.end} min={value.start || undefined} onChange={(end) => onChange({ ...value, end })} />
      </label>
    </div>
  );
}
