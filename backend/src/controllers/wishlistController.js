const repo = require('../db/wishlistRepository');

async function list(req, res) {
  res.json(await repo.list(req.deviceId));
}

async function add(req, res) {
  const { id, title, posterUrl, year, rating } = req.body || {};

  if (!id || !title) {
    return res.status(400).json({
      error: 'id and title are required'
    });
  }

  await repo.add(req.deviceId, {
    id,
    title,
    posterUrl,
    year,
    rating
  });

  res.status(201).json({ ok: true });
}

async function remove(req, res) {
  const movieId = Number(req.params.movieId);

  const removed = await repo.remove(req.deviceId, movieId);

  if (!removed) {
    return res.status(404).json({
      error: 'Not in wishlist'
    });
  }

  res.json({ ok: true });
}

module.exports = {
  list,
  add,
  remove
};