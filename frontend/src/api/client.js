const BASE_URL = '/api';

function getDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('deviceId', id);
  }
  return id;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': getDeviceId(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore - response wasn't JSON
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  discoverMovies({ page = 1, genre, sortBy, query } = {}) {
    const params = new URLSearchParams({ page: String(page) });
    if (genre) params.set('genre', genre);
    if (sortBy) params.set('sortBy', sortBy);
    if (query) params.set('query', query);
    return request(`/movies?${params.toString()}`);
  },
  getMovie(id) {
    return request(`/movies/${id}`);
  },
  getGenres() {
    return request('/movies/genres');
  },
  getWishlist() {
    return request('/wishlist');
  },
  addToWishlist(movie) {
    return request('/wishlist', { method: 'POST', body: JSON.stringify(movie) });
  },
  removeFromWishlist(movieId) {
    return request(`/wishlist/${movieId}`, { method: 'DELETE' });
  },
};
