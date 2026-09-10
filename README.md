# Reel Find — Movie Discovery App

A full-stack movie discovery app built with **React (Vite)** on the frontend and **Node.js/Express** on the backend, using **TMDB (The Movie Database)** as the external movie data source and **SQLite** for wishlist persistence.

## Setup

### Prerequisites
- Node.js 18+
- A free TMDB API key: https://www.themoviedb.org/settings/api

### Backend
```bash
cd backend
cp .env.example .env
# edit .env and set TMDB_API_KEY
npm install
npm run dev        # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173 (proxies /api to :5000)
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the backend, so no CORS configuration is needed locally beyond what's already in `server.js`.

## Approach

The brief asks for a product that "feels like a real movie discovery product," not an API demo, so the design choices below all trace back to two things: **the backend owns TMDB, the client never sees it**, and **the app should stay responsive and correct under real conditions** (slow network, flaky upstream, fast filter changes, large result sets).

- **Backend as abstraction layer** — the frontend only ever talks to `/api/movies` and `/api/wishlist`. TMDB's raw response shape, its image path scheme, its inconsistent field naming (`vote_average`, `genre_ids` vs `genres`) are all normalized in `tmdbService.js` into a single flat `Movie` shape the client can rely on unconditionally.
- **One discover endpoint for browse and search** — `GET /api/movies` handles both "browse by popularity/genre/sort" and "search by title," so the frontend has a single paginated list abstraction regardless of mode, rather than two different data shapes to reconcile.
- **Resilience patterns mirrored from a real production stack**: retry with backoff for transient TMDB failures, honoring TMDB's `Retry-After` on 429s, and a circuit breaker that fails fast (and falls back to stale cache) once TMDB looks consistently down, instead of piling up retries against a struggling service.
- **Caching + request de-duplication** — identical requests (e.g. two tabs browsing the same page, or a burst of retries) share one in-flight upstream call instead of firing duplicates, and successful responses are cached with a TTL so repeated browsing of the same page/filter doesn't re-hit TMDB every time.
- **Debounced search + stale-response guarding** — the frontend debounces keystrokes (400ms) before querying, and tags each request with an incrementing id so a slow, superseded response can never overwrite the result of a newer one if the user changes filters quickly.
- **Infinite scroll via IntersectionObserver** — results load a page at a time as the user nears the bottom, so the DOM and network cost stay proportional to how far someone has actually scrolled rather than growing with total catalog size.
- **Optimistic wishlist updates** — toggling the heart updates the UI immediately and rolls back on failure, so the interaction feels instant rather than blocked on a round trip.

## Key Technical Decisions

| Area | Decision | Reasoning |
|---|---|---|
| External API | TMDB | Free, well-documented, generous rate limits, rich metadata (genres, ratings, posters) |
| Backend framework | Express | Minimal, well understood, easy to reason about for a small API surface |
| Wishlist storage | SQLite (`better-sqlite3`) | Zero external infra, synchronous API keeps the code simple, file survives restarts — fits the "persist across sessions" requirement without needing a hosted DB for this scope |
| Wishlist ownership | A generated `deviceId` (UUID) stored in `localStorage`, sent as `X-Device-Id` | The brief doesn't call for authentication, but a wishlist still needs to belong to *someone* rather than be global. This scopes it per-browser without building a full account system that's out of scope. See **Assumptions**. |
| Caching | In-memory TTL cache + in-flight de-duplication, per-key | Sufficient for a single backend process; the interface is small enough to swap for Redis later without touching call sites |
| Failure handling | Retry w/ backoff + circuit breaker + stale-cache fallback | Keeps the app usable when TMDB is slow/down instead of surfacing a raw error immediately |
| Pagination | Infinite scroll (IntersectionObserver) | Matches "continue exploring when there are many matching results" better than numbered pages for a browse-first experience |
| Frontend state | React Context for wishlist, URL search params for browse filters | Wishlist status needs to be visible across pages instantly; filters in the URL make browsing state shareable/back-button-friendly |
| Styling | Hand-written CSS, no framework | Keeps the bundle small and every style decision explicit and explainable |

## Data Flow

1. Client requests `/api/movies?query=...&genre=...&sortBy=...&page=...`.
2. Controller builds a cache key from those params and asks `cacheService.getOrFetch`.
3. On a cache miss, `tmdbService` calls TMDB through the circuit breaker + retry wrapper, normalizes the response, and returns it.
4. The result is cached (TTL) and returned to the client in the app's own `Movie` shape.
5. Wishlist add/remove writes a movie *snapshot* (title, poster, year, rating) to SQLite, keyed by `(deviceId, movieId)`, so the wishlist page renders instantly without re-fetching each movie from TMDB.

## Assumptions

- No login/authentication was in scope, so wishlists are scoped by a per-browser device id rather than a user account. This means the wishlist doesn't follow a user across devices/browsers — a real product would replace this with an auth system, and the device id would become the initial anonymous-session id that gets merged into an account on sign-up.
- "Persistent wishlist... after closing and reopening the app" is interpreted as surviving a full app restart, which SQLite + a stable device id satisfies.
- A single backend instance is assumed (the in-memory cache and circuit breaker are per-process); a multi-instance deployment would need to move both to a shared store (see below).

## Known Limitations

- The in-memory cache resets on backend restart — acceptable for this scope, but means a cold-started backend will briefly re-hit TMDB.
- No automated test suite was written given the assignment's time scope; the areas I'd prioritize testing first are the normalization logic in `tmdbService.js` and the circuit breaker's state transitions.
- Genre filter and sort are only applied server-side for browse mode; TMDB's `/search/movie` endpoint doesn't support `sort_by` or `with_genres`, so those controls are disabled while a search query is active (noted in the UI).
- No cast/crew or trailer data is shown on the details page — TMDB supports it, but it wasn't essential to the core discovery flow described in the brief.

## What I'd Improve With More Time

- Move the cache to Redis and the circuit breaker's state to a shared store, so the resilience patterns hold up across multiple backend instances.
- Add a real account system and merge anonymous device-id wishlists into it on sign-up.
- Add cast/crew, trailers, and "similar movies" to the details page.
- Add integration tests around the TMDB service's failure paths (timeout, 429, 5xx) and the wishlist API.
- Virtualize the movie grid (e.g. `react-window`) for very large result sets to reduce DOM node count further.

## AI Transparency

AI (Claude) was used throughout to generate the initial project scaffold, boilerplate for the Express routes/controllers, the React component structure, and the resilience utilities (circuit breaker, cache de-duplication). The overall architecture — backend-as-abstraction-layer, the caching/circuit-breaker approach, the device-id wishlist scoping, and the endpoint/data-flow design — reflects deliberate decisions made for this assignment, and I can walk through, modify, or extend any part of the implementation on request.

## Project Structure

```
movie-discovery-app/
├── backend/
│   └── src/
│       ├── config/          # env-driven configuration
│       ├── controllers/     # request handlers
│       ├── db/               # SQLite connection + wishlist repository
│       ├── middleware/      # device-id resolution, error handling
│       ├── routes/           # /api/movies, /api/wishlist
│       ├── services/         # TMDB client, cache, circuit breaker
│       └── server.js
└── frontend/
    └── src/
        ├── api/               # fetch client
        ├── components/        # MovieCard, MovieGrid, FilterBar, etc.
        ├── context/           # WishlistContext (global wishlist state)
        ├── hooks/             # useDebounce, useInfiniteScroll
        ├── pages/             # Home, MovieDetails, Wishlist
        └── styles/
```
