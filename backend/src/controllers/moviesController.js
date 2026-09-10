const cache = require('../services/cacheService');
const tmdb = require('../services/tmdbService');
const config = require('../config');

/**
 * GET /api/movies?page=&genre=&sortBy=&query=
 *
 * One endpoint covers both "browse" (default, sorted by popularity) and
 * "search" (when query is present) so the frontend can treat them as the
 * same paginated list and swap seamlessly between searching and
 * filtering without a different code path per mode.
 */
async function discover(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const { genre, sortBy, query } = req.query;

    const cacheKey = `discover:${query || ''}:${genre || ''}:${sortBy || 'popularity.desc'}:${page}`;
    const ttl = config.cache.discoverTtl;

    const { data } = await cache.getOrFetch(cacheKey, ttl, () =>
      tmdb.discoverMovies({ page, genreId: genre, sortBy, query })
    );

    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function details(req, res, next) {
  try {
    const { id } = req.params;
    const cacheKey = `movie:${id}`;
    const { data } = await cache.getOrFetch(cacheKey, config.cache.detailsTtl, () =>
      tmdb.getMovieDetails(id)
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function genres(req, res, next) {
  try {
    const { data } = await cache.getOrFetch('genres', config.cache.genresTtl, () => tmdb.getGenres());
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { discover, details, genres };
