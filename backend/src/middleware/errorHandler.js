/**
 * Central place to translate internal errors (TMDB failures, circuit
 * breaker trips, bad input) into a consistent JSON error shape the
 * frontend can rely on: { error: string, code?: string }.
 */
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'CIRCUIT_OPEN') {
    return res.status(503).json({
      error: 'The movie database is temporarily unavailable. Please try again shortly.',
      code: 'UPSTREAM_UNAVAILABLE',
    });
  }

  if (err.status === 404) {
    return res.status(404).json({ error: 'Movie not found', code: 'NOT_FOUND' });
  }

  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: 'Invalid request to movie database', code: 'BAD_UPSTREAM_REQUEST' });
  }

  return res.status(502).json({
    error: 'Something went wrong while fetching movie data. Please try again.',
    code: 'UPSTREAM_ERROR',
  });
};
