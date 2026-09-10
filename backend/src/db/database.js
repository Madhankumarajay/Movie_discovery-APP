const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('../config');

const dbPath = path.resolve(process.cwd(), config.db.path);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

/**
 * Wishlist is the one piece of data that genuinely belongs to us rather
 * than TMDB: it's user-generated and needs to survive restarts.
 *
 * We store a *snapshot* of the movie (title/poster/year/rating) alongside
 * the id, rather than only the id. That means the wishlist page can
 * render instantly without an extra round trip per movie, and it still
 * reads sensibly even if the movie is later removed from TMDB or its
 * details change. `device_id` stands in for a user account - see the
 * README for why (no auth was in scope for this assignment).
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS wishlist (
    device_id   TEXT NOT NULL,
    movie_id    INTEGER NOT NULL,
    title       TEXT NOT NULL,
    poster_url  TEXT,
    year        TEXT,
    rating      REAL,
    added_at    TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (device_id, movie_id)
  );

  CREATE INDEX IF NOT EXISTS idx_wishlist_device ON wishlist(device_id);
`);

module.exports = db;
