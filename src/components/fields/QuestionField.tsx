import type { QuestionConfig } from '../../constants/questionFlows';

import type { DateRangeValue, DateTimeRangeValue, LocationValue } from '../../lib/fieldValues';

import { DateField } from './DateField';
import { DateRangeField } from './DateRangeField';
import { DateTimeRangeField } from './DateTimeRangeField';
import { LocationField } from './LocationField';
import { NumberField } from './NumberField';
import { TimeField } from './TimeField';
import { InterestPickerField } from './InterestPickerField';
import { Input } from '../ui/Input';
import './fields.css';

type QuestionFieldProps = {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
};

function parseJsonValue<T>(value: string, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  switch (question.type) {
    case 'date':
      return <DateField value={value} onChange={onChange} />;
    case 'time':
      return <TimeField value={value} onChange={onChange} />;
    case 'date_range':
      return (
        <DateRangeField
          value={parseJsonValue<DateRangeValue>(value, { start: '', end: '' })}
          onChange={(next) => onChange(JSON.stringify(next))}
        />
      );
    case 'datetime_range':
      return (
        <DateTimeRangeField
          value={parseJsonValue<DateTimeRangeValue>(value, { date: '', start: '', end: '' })}
          onChange={(next) => onChange(JSON.stringify(next))}
        />
      );
    case 'location':
      return (
        <LocationField
          value={parseJsonValue<LocationValue | null>(value, null)}
          placeholder={question.placeholder}
          onChange={(next) => onChange(JSON.stringify(next))}
        />
      );
    case 'number':
      return (
        <NumberField
          value={value}
          onChange={onChange}
          placeholder={question.placeholder}
          min={question.min}
          max={question.max}
          step={question.step}
          prefix={question.prefix}
        />
      );
    case 'interests':
      return (
        <InterestPickerField
          value={value}
          presets={question.interestOptions ?? []}
          placeholder={question.placeholder}
          onChange={onChange}
        />
      );
    case 'select':
      return (
        <div className="select-field">
          {question.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`select-field__option ${value === option.value ? 'select-field__option--active' : ''}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      );
    case 'textarea':
      return (
        <Input
          multiline
          rows={4}
          value={value}
          placeholder={question.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    default:
      return (
        <Input
          value={value}
          placeholder={question.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}
