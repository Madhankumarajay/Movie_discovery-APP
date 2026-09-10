import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import SearchBar from '../components/SearchBar.jsx';
import FilterBar from '../components/FilterBar.jsx';
import MovieGrid from '../components/MovieGrid.jsx';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

// Module-level cache (survives navigating to a movie's details page and
// back, without persisting across a full reload). Keyed by the exact
// query the user was browsing, so "continue exploring / open a movie /
// come back" restores the list and scroll position instead of starting
// over at page 1. A real product might use React Query or persist this
// in sessionStorage; this is a deliberately small version of the same
// idea, sized for the scope of this assignment.
const resultsCache = new Map();

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const sortBy = searchParams.get('sort') || 'popularity.desc';

  const [searchInput, setSearchInput] = useState(query);
  const debouncedQuery = useDebounce(searchInput, 400);

  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  const cacheKey = `${debouncedQuery}|${genre}|${sortBy}`;
  const requestIdRef = useRef(0);

  // Keep the URL in sync with the debounced search so the browse state
  // is shareable/bookmarkable and survives a back-navigation.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedQuery) next.set('q', debouncedQuery);
    else next.delete('q');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  useEffect(() => {
    api.getGenres().then(setGenres).catch(() => setGenres([]));
  }, []);

  const fetchPage = useCallback(
    async (targetPage, { append }) => {
      const requestId = ++requestIdRef.current;
      setStatus('loading');
      setError(null);
      try {
        const data = await api.discoverMovies({
          page: targetPage,
          genre: genre || undefined,
          sortBy: query ? undefined : sortBy,
          query: debouncedQuery || undefined,
        });
        // Ignore stale responses from a superseded request (e.g. the
        // user changed filters again before this one returned).
        if (requestId !== requestIdRef.current) return;

        setMovies((prev) => {
          const next = append ? [...prev, ...data.results] : data.results;
          resultsCache.set(cacheKey, { movies: next, page: targetPage, totalPages: data.totalPages });
          return next;
        });
        setPage(targetPage);
        setTotalPages(data.totalPages);
        setStatus('success');
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setStatus('error');
        setError(err.message);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [genre, sortBy, debouncedQuery, cacheKey]
  );

  // Whenever the effective query changes, either restore from cache or
  // fetch page 1 fresh.
  useEffect(() => {
    const cached = resultsCache.get(cacheKey);
    if (cached) {
      setMovies(cached.movies);
      setPage(cached.page);
      setTotalPages(cached.totalPages);
      setStatus('success');
    } else {
      setMovies([]);
      fetchPage(1, { append: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const loadMore = useCallback(() => {
    if (status === 'loading' || page >= totalPages) return;
    fetchPage(page + 1, { append: true });
  }, [status, page, totalPages, fetchPage]);

  const sentinelRef = useInfiniteScroll({ onIntersect: loadMore, enabled: page < totalPages });

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="page">
      <section className="hero">
        <h1>Find something worth watching</h1>
        <p>Browse trending titles, search for a favorite, or filter by genre.</p>
        <SearchBar value={searchInput} onChange={setSearchInput} />
      </section>

      <FilterBar
        genres={genres}
        activeGenre={genre}
        onGenreChange={(g) => updateParam('genre', g)}
        sortBy={sortBy}
        onSortChange={(s) => updateParam('sort', s)}
        disabled={!!debouncedQuery}
      />

      <MovieGrid
        movies={movies}
        status={status}
        error={error}
        onRetry={() => fetchPage(page, { append: false })}
        emptyMessage={
          debouncedQuery
            ? `No results for "${debouncedQuery}". Try a different title.`
            : 'No movies match these filters.'
        }
        sentinelRef={sentinelRef}
      />
    </div>
  );
}
