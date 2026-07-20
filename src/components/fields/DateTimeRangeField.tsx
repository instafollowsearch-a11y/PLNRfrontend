import type { DateTimeRangeValue } from '../../lib/fieldValues';

import { DateField } from './DateField';
import { TimeField } from './TimeField';
import './fields.css';

type DateTimeRangeFieldProps = {
  value: DateTimeRangeValue;
  onChange: (value: DateTimeRangeValue) => void;
};

export function DateTimeRangeField({ value, onChange }: DateTimeRangeFieldProps) {
  return (
    <div className="field-datetime-range">
      <label className="field-range__item field-range__item--full">
        <span className="field-range__label">Date</span>
        <DateField value={value.date} onChange={(date) => onChange({ ...value, date })} />
      </label>
      <div className="field-range">
        <label className="field-range__item">
          <span className="field-range__label">Start time</span>
          <TimeField value={value.start} onChange={(start) => onChange({ ...value, start })} />
        </label>
        <label className="field-range__item">
          <span className="field-range__label">End time</span>
          <TimeField value={value.end} onChange={(end) => onChange({ ...value, end })} />
        </label>
      </div>
    </div>
  );
}
