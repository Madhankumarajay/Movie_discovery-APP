import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import SearchBar from '../components/SearchBar.jsx';
import FilterBar from '../components/FilterBar.jsx';
import MovieGrid from '../components/MovieGrid.jsx';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';


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

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedQuery) next.set('q', debouncedQuery);
    else next.delete('q');
    setSearchParams(next, { replace: true });
    
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
    
    [genre, sortBy, debouncedQuery, cacheKey]
  );

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
        <h1>Every Movie has a Story.Find Yours....</h1>
        <p>Explore Movies,Discover hidden Gems,and find your next Favorite Movies..</p>
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
