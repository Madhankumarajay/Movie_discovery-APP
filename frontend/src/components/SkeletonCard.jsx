export default function SkeletonCard() {
  return (
    <div className="movie-card movie-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--poster" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line skeleton--line-short" />
    </div>
  );
}
