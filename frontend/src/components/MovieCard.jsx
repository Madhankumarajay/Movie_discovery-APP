import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function MovieCard({ movie }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(movie.id);

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-card__link">
        <div className="movie-card__poster-wrap">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              loading="lazy"
              className="movie-card__poster"
            />
          ) : (
            <div className="movie-card__poster movie-card__poster--placeholder">No Image</div>
          )}
          {movie.rating != null && (
            <span className="movie-card__rating">★ {movie.rating.toFixed(1)}</span>
          )}
        </div>
        <div className="movie-card__title" title={movie.title}>
          {movie.title}
        </div>
        <div className="movie-card__year">{movie.year || 'Unknown year'}</div>
      </Link>
      <button
        type="button"
        className={`wishlist-btn ${saved ? 'wishlist-btn--active' : ''}`}
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={() => toggle(movie)}
      >
        {saved ? '♥' : '♡'}
      </button>
    </div>
  );
}
