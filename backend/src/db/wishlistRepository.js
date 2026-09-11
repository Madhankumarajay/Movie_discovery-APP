const { getDatabase } = require('./database');

function collection() {
  return getDatabase().collection('wishlist');
}

async function list(deviceId) {
  return await collection()
      .find({ deviceId })
      .sort({ addedAt: -1 })
      .toArray();
}

async function isSaved(deviceId, movieId) {
  const movie = await collection().findOne({
    deviceId,
    movieId: Number(movieId)
  });

  return !!movie;
}

async function add(deviceId, movie) {
  await collection().updateOne(
      {
        deviceId,
        movieId: Number(movie.id)
      },
      {
        $setOnInsert: {
          deviceId,
          movieId: Number(movie.id),
          title: movie.title,
          posterUrl: movie.posterUrl,
          year: movie.year,
          rating: movie.rating,
          addedAt: new Date()
        }
      },
      { upsert: true }
  );
}

async function remove(deviceId, movieId) {
  const result = await collection().deleteOne({
    deviceId,
    movieId: Number(movieId)
  });

  return result.deletedCount > 0;
}

module.exports = {
  list,
  isSaved,
  add,
  remove
};