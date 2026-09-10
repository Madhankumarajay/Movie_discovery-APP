export default function EmptyState({ message }) {
  return (
    <div className="state-panel">
      <div className="state-panel__icon">🎬</div>
      <p>{message}</p>
    </div>
  );
}
