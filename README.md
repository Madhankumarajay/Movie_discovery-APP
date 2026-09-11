## Project Structure

movie-discovery-app/
├── backend/
│   └── src/
│       ├── config/          env-driven configuration
│       ├── controllers/     request handlers
│       ├── db/              SQLite connection + wishlist repository
│       ├── middleware/      device-id resolution, error handling
│       ├── routes/          /api/movies, /api/wishlist
│       ├── services/        TMDB client, cache, circuit breaker
│       └── server.js
└── frontend/
    └── src/
        ├── api/               fetch client
        ├── components/        MovieCard, MovieGrid, FilterBar, etc.
        ├── context/           WishlistContext (global wishlist state)
        ├── hooks/             useDebounce, useInfiniteScroll
        ├── pages/             Home, MovieDetails, Wishlist
        └── styles/
```
