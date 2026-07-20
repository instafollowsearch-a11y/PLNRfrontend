import './fields.css';

type TimeFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TimeField({ value, onChange }: TimeFieldProps) {
  return (
    <input
      type="time"
      className="field-control field-control--time"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
