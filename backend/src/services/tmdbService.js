const axios = require('axios');
const config = require('../config');
const { CircuitBreaker, OPEN } = require('./circuitBreaker');

const breaker = new CircuitBreaker(config.circuitBreaker);

const client = axios.create({
  baseURL: config.tmdb.baseUrl,
  timeout: 6000,
  params: { api_key: config.tmdb.apiKey },
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callTmdb(path, params = {}, { retries = 2 } = {}) {
  if (!breaker.canRequest()) {
    const err = new Error('TMDB circuit breaker is open - upstream API considered unavailable');
    err.code = 'CIRCUIT_OPEN';
    throw err;
  }

  let attempt = 0;
  while (true) {
    try {
      const response = await client.get(path, { params });
      breaker.onSuccess();
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 429 && attempt < retries) {
        const retryAfterSec = Number(err.response.headers['retry-after']) || 1;
        await sleep(retryAfterSec * 1000);
        attempt += 1;
        continue;
      }

      const isTransient = !status || status >= 500 || err.code === 'ECONNABORTED';
      if (isTransient && attempt < retries) {
        await sleep(2 ** attempt * 300);
        attempt += 1;
        continue;
      }

      breaker.onFailure();
      const wrapped = new Error(`TMDB request failed: ${err.message}`);
      wrapped.status = status;
      wrapped.cause = err;
      throw wrapped;
    }
  }
}

function imageUrl(path, size = 'w500') {
  return path ? `${config.tmdb.imageBaseUrl}/${size}${path}` : null;
}

function normalizeMovie(raw) {
  return {
    id: raw.id,
    title: raw.title || raw.name || 'Untitled',
    overview: raw.overview && raw.overview.trim().length > 0
      ? raw.overview
      : 'No synopsis available for this title yet.',
    releaseDate: raw.release_date || null,
    year: raw.release_date ? raw.release_date.slice(0, 4) : null,
    posterUrl: imageUrl(raw.poster_path, 'w500'),
    backdropUrl: imageUrl(raw.backdrop_path, 'w1280'),
    rating: typeof raw.vote_average === 'number' ? Math.round(raw.vote_average * 10) / 10 : null,
    voteCount: raw.vote_count || 0,
    genreIds: raw.genre_ids || (raw.genres ? raw.genres.map((g) => g.id) : []),
    genres: raw.genres ? raw.genres.map((g) => ({ id: g.id, name: g.name })) : undefined,
    runtime: raw.runtime ?? null,
    tagline: raw.tagline || null,
    popularity: raw.popularity || 0,
  };
}

async function discoverMovies({ page = 1, genreId, sortBy = 'popularity.desc', query }) {
  if (query && query.trim().length > 0) {
    const data = await callTmdb('/search/movie', { query, page, include_adult: false });
    return {
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      results: data.results.map(normalizeMovie),
    };
  }

  const params = { page, sort_by: sortBy, include_adult: false };
  if (genreId) params.with_genres = genreId;

  const data = await callTmdb('/discover/movie', params);
  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(normalizeMovie),
  };
}

async function getMovieDetails(id) {
  const data = await callTmdb(`/movie/${id}`, {});
  return normalizeMovie(data);
}

async function getGenres() {
  const data = await callTmdb('/genre/movie/list', {});
  return data.genres;
}

module.exports = {
  discoverMovies,
  getMovieDetails,
  getGenres,
  breaker,
};
