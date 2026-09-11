import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => new Set());
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await api.getWishlist();
      setItems(list);
      setIds(new Set(list.map((m) => m.movieId)));
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSaved = useCallback((movieId) => ids.has(movieId), [ids]);

  const toggle = useCallback(
    async (movie) => {
      const saved = ids.has(movie.id);
      
      setIds((prev) => {
        const next = new Set(prev);
        saved ? next.delete(movie.id) : next.add(movie.id);
        return next;
      });
      try {
        if (saved) {
          await api.removeFromWishlist(movie.id);
        } else {
          await api.addToWishlist({
            id: movie.id,
            title: movie.title,
            posterUrl: movie.posterUrl,
            year: movie.year,
            rating: movie.rating,
          });
        }
        await refresh();
      } catch (err) {
        setIds((prev) => {
          const next = new Set(prev);
          saved ? next.add(movie.id) : next.delete(movie.id);
          return next;
        });
        throw err;
      }
    },
    [ids, refresh]
  );

  return (
    <WishlistContext.Provider value={{ items, isSaved, toggle, loaded, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
