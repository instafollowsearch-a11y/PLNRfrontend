import {
  isOldEnoughToRegister,
  MINIMUM_ACCOUNT_AGE,
  minimumAllowedBirthDateIso,
} from '../../lib/ageGate';
import { Input } from '../ui/Input';
import './BirthDateField.css';

type BirthDateFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

export function BirthDateField({ value, onChange }: BirthDateFieldProps) {
  const showAgeError = Boolean(value.trim()) && !isOldEnoughToRegister(value);

  return (
    <div className="birth-date-field">
      <Input
        label="Birthday"
        type="date"
        autoComplete="bday"
        value={value}
        min={minimumAllowedBirthDateIso()}
        max={todayIso()}
        onChange={(event) => onChange(event.target.value)}
        required
        error={showAgeError ? `You must be at least ${MINIMUM_ACCOUNT_AGE} to use PLNR.` : null}
      />
    </div>
  );
}
