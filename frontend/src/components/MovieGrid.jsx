import MovieCard from './MovieCard.jsx';
import SkeletonCard from './SkeletonCard.jsx';
import EmptyState from './EmptyState.jsx';
import ErrorState from './ErrorState.jsx';

export default function MovieGrid({ movies, status, error, onRetry, emptyMessage, sentinelRef }) {
  if (status === 'error' && movies.length === 0) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (status !== 'loading' && movies.length === 0) {
    return <EmptyState message={emptyMessage || 'No movies found. Try a different search or filter.'} />;
  }

  return (
    <>
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
        {status === 'loading' &&
          Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
      </div>
      {status === 'error' && (
        <div className="inline-error">
          Couldn&apos;t load more results. <button onClick={onRetry}>Retry</button>
        </div>
      )}
      <div ref={sentinelRef} className="scroll-sentinel" />
    </>
  );
}
