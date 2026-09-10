import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useWishlist } from '../context/WishlistContext.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const { isSaved, toggle } = useWishlist();

  const load = () => {
    setStatus('loading');
    api
      .getMovie(id)
      .then((data) => {
        setMovie(data);
        setStatus('success');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  };

  useEffect(load, [id]);

  if (status === 'loading') {
    return (
      <div className="page details details--loading" aria-busy="true">
        <div className="skeleton skeleton--backdrop" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  const saved = isSaved(movie.id);

  return (
    <div className="page details">
      <Link to="/" className="back-link">
        ← Back to browsing
      </Link>

      <div
        className="details__hero"
        style={movie.backdropUrl ? { backgroundImage: `url(${movie.backdropUrl})` } : undefined}
      >
        <div className="details__hero-overlay" />
      </div>

      <div className="details__body">
        <div className="details__poster-wrap">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} className="details__poster" />
          ) : (
            <div className="details__poster details__poster--placeholder">No Image</div>
          )}
        </div>

        <div className="details__info">
          <h1>{movie.title}</h1>
          {movie.tagline && <p className="details__tagline">{movie.tagline}</p>}

          <div className="details__meta">
            {movie.year && <span>{movie.year}</span>}
            {movie.runtime ? <span>{movie.runtime} min</span> : null}
            {movie.rating != null && <span>★ {movie.rating.toFixed(1)} ({movie.voteCount} votes)</span>}
          </div>

          {movie.genres?.length > 0 && (
            <div className="details__genres">
              {movie.genres.map((g) => (
                <span key={g.id} className="chip chip--static">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          <p className="details__overview">{movie.overview}</p>

          <button
            type="button"
            className={`btn btn--wishlist ${saved ? 'btn--active' : ''}`}
            onClick={() => toggle(movie)}
          >
            {saved ? '♥ Saved to wishlist' : '♡ Add to wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
