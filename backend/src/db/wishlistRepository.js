const db = require('./database');

const listStmt = db.prepare(
  'SELECT movie_id as movieId, title, poster_url as posterUrl, year, rating, added_at as addedAt FROM wishlist WHERE device_id = ? ORDER BY added_at DESC'
);
const findStmt = db.prepare('SELECT 1 FROM wishlist WHERE device_id = ? AND movie_id = ?');
const insertStmt = db.prepare(`
  INSERT INTO wishlist (device_id, movie_id, title, poster_url, year, rating)
  VALUES (@deviceId, @movieId, @title, @posterUrl, @year, @rating)
  ON CONFLICT(device_id, movie_id) DO NOTHING
`);
const deleteStmt = db.prepare('DELETE FROM wishlist WHERE device_id = ? AND movie_id = ?');

module.exports = {
  list(deviceId) {
    return listStmt.all(deviceId);
  },
  isSaved(deviceId, movieId) {
    return !!findStmt.get(deviceId, movieId);
  },
  add(deviceId, movie) {
    insertStmt.run({
      deviceId,
      movieId: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      year: movie.year,
      rating: movie.rating,
    });
  },
  remove(deviceId, movieId) {
    const result = deleteStmt.run(deviceId, movieId);
    return result.changes > 0;
  },
};
