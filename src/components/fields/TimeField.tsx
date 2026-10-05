import './fields.css';

type TimeFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;
const MINUTES = ['00', '15', '30', '45'] as const;

function readTime(value: string): { hour: string; minute: string; period: 'AM' | 'PM' } {
  const [rawHours, rawMinutes] = value.split(':').map(Number);

  if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) {
    return { hour: '8', minute: '00', period: 'AM' };
  }

  const period = rawHours >= 12 ? 'PM' : 'AM';
  const hour = String(rawHours % 12 || 12);
  const minute = MINUTES.reduce((closest, option) => {
    return Math.abs(Number(option) - rawMinutes) < Math.abs(Number(closest) - rawMinutes) ? option : closest;
  }, MINUTES[0]);

  return { hour, minute, period };
}

function writeTime(hour: string, minute: string, period: 'AM' | 'PM'): string {
  let hours = Number(hour) % 12;

  if (period === 'PM') {
    hours += 12;
  }

  return `${String(hours).padStart(2, '0')}:${minute}`;
}

export function TimeField({ value, onChange }: TimeFieldProps) {
  const time = value ? readTime(value) : null;

  function update(next: Partial<{ hour: string; minute: string; period: 'AM' | 'PM' }>) {
    const base = time ?? { hour: '8', minute: '00', period: 'AM' as const };
    onChange(writeTime(next.hour ?? base.hour, next.minute ?? base.minute, next.period ?? base.period));
  }

  return (
    <div className="time-field">
      <label className="time-field__part">
        <span>Hour</span>
        <select className="field-control field-control--time" value={time?.hour ?? ''} aria-label="Hour" onChange={(event) => update({ hour: event.target.value })}>
          {time ? null : <option value="">Hour</option>}
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
      </label>
      <label className="time-field__part">
        <span>Minute</span>
        <select className="field-control field-control--time" value={time?.minute ?? ''} aria-label="Minute" onChange={(event) => update({ minute: event.target.value })}>
          {time ? null : <option value="">Minute</option>}
          {MINUTES.map((minute) => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </select>
      </label>
      <label className="time-field__part">
        <span>AM/PM</span>
        <select
          className="field-control field-control--time"
          value={time?.period ?? ''}
          aria-label="AM or PM"
          onChange={(event) => update({ period: event.target.value === 'PM' ? 'PM' : 'AM' })}
        >
          {time ? null : <option value="">AM/PM</option>}
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </label>
    </div>
  );
}
