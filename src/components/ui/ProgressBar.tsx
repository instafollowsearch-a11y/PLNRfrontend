import './ProgressBar.css';

type ProgressBarProps = {
  step: number;
  total: number;
};

export function ProgressBar({ step, total }: ProgressBarProps) {
  const percent = total > 0 ? ((step + 1) / total) * 100 : 0;

  return (
    <div className="progress-bar" aria-hidden>
      <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
