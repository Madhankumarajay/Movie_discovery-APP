const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const moviesRoutes = require('./routes/movies');
const wishlistRoutes = require('./routes/wishlist');
const errorHandler = require('./middleware/errorHandler');
const { breaker } = require('./services/tmdbService');

if (!config.tmdb.apiKey) {
  // Fail loudly at startup rather than surfacing a confusing 401 on the
  // first request - much faster to diagnose during setup.
  console.warn('WARNING: TMDB_API_KEY is not set. Copy .env.example to .env and add your key.');
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Protects our own backend (and TMDB, transitively) from being hammered
// by a buggy or malicious client - e.g. a runaway search-as-you-type
// loop on the frontend. This is separate from TMDB's own rate limits,
// which the circuit breaker + retry logic in tmdbService handle.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', tmdbCircuit: breaker.getState() });
});

app.use('/api/movies', moviesRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Movie discovery backend listening on port ${config.port}`);
});
