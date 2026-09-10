export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel state-panel--error">
      <div className="state-panel__icon">⚠️</div>
      <p>{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
