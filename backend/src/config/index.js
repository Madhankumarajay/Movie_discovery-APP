require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  tmdb: {
    apiKey: process.env.TMDB_API_KEY,
    baseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    imageBaseUrl: process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
  },

  db: {
    path: process.env.DB_PATH || './data/app.db',
  },

  cache: {
    discoverTtl: Number(process.env.CACHE_TTL_DISCOVER || 300),
    detailsTtl: Number(process.env.CACHE_TTL_DETAILS || 3600),
    genresTtl: Number(process.env.CACHE_TTL_GENRES || 86400),
  },

  circuitBreaker: {
    failureThreshold: Number(process.env.CB_FAILURE_THRESHOLD || 5),
    resetTimeoutMs: Number(process.env.CB_RESET_TIMEOUT_MS || 30000),
  },
};
