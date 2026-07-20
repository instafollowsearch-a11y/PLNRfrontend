import './LoadingState.css';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-state__spinner" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
