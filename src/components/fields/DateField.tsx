import './fields.css';

type DateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
};

function todayIso(): string {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, '0');

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function earliestSelectableDate(min?: string): string {
  const today = todayIso();
  if (!min || min < today) {
    return today;
  }

  return min;
}

export function DateField({ value, onChange, min }: DateFieldProps) {
  return (
    <input
      type="date"
      className="field-control field-control--date"
      value={value}
      min={earliestSelectableDate(min)}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
