import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Wishlist() {
  const { items, loaded, toggle } = useWishlist();

  if (loaded && items.length === 0) {
    return (
      <div className="page">
        <h1>Your Wishlist</h1>
        <EmptyState message="You haven't saved any movies yet. Browse and tap the heart on a title to save it here." />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your Wishlist</h1>
      <div className="movie-grid">
        {items.map((m) => (
          <div className="movie-card" key={m.movieId}>
            <Link to={`/movie/${m.movieId}`} className="movie-card__link">
              <div className="movie-card__poster-wrap">
                {m.posterUrl ? (
                  <img src={m.posterUrl} alt={m.title} className="movie-card__poster" loading="lazy" />
                ) : (
                  <div className="movie-card__poster movie-card__poster--placeholder">No Image</div>
                )}
                {m.rating != null && <span className="movie-card__rating">★ {m.rating.toFixed(1)}</span>}
              </div>
              <div className="movie-card__title" title={m.title}>
                {m.title}
              </div>
              <div className="movie-card__year">{m.year || 'Unknown year'}</div>
            </Link>
            <button
              type="button"
              className="wishlist-btn wishlist-btn--active"
              aria-label="Remove from wishlist"
              onClick={() => toggle({ id: m.movieId, title: m.title })}
            >
              ♥
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
