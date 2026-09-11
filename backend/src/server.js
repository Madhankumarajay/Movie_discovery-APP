const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDatabase } = require('./db/database');

const config = require('./config');
const moviesRoutes = require('./routes/movies');
const wishlistRoutes = require('./routes/wishlist');
const errorHandler = require('./middleware/errorHandler');
const { breaker } = require('./services/tmdbService');

if (!config.tmdb.apiKey) {
  console.warn('WARNING: TMDB_API_KEY is not set. Copy .env.example to .env and add your key.');
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

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

async function startServer() {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`Movie discovery backend listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

startServer();
