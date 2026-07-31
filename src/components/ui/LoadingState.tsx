import './LoadingState.css';

type LoadingStateProps = {
  message?: string;
  subtitle?: string;
  variant?: 'default' | 'gathering';
};

export function LoadingState({
  message = 'Loading…',
  subtitle,
  variant = 'default',
}: LoadingStateProps) {
  const isGathering = variant === 'gathering';

  return (
    <div className={`loading-state${isGathering ? ' loading-state--gathering' : ''}`} role="status">
      {isGathering ? (
        <div className="loading-state__orbit" aria-hidden>
          <span className="loading-state__pulse" />
          <span className="loading-state__ring" />
          <span className="loading-state__dot loading-state__dot--a" />
          <span className="loading-state__dot loading-state__dot--b" />
          <span className="loading-state__dot loading-state__dot--c" />
        </div>
      ) : (
        <span className="loading-state__spinner" aria-hidden />
      )}
      <p className={isGathering ? 'loading-state__title' : undefined}>{message}</p>
      {subtitle ? <p className="loading-state__subtitle">{subtitle}</p> : null}
    </div>
  );
}
