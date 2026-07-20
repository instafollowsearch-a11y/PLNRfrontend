import './fields.css';

type DateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
};

export function DateField({ value, onChange, min }: DateFieldProps) {
  return (
    <input
      type="date"
      className="field-control field-control--date"
      value={value}
      min={min}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
