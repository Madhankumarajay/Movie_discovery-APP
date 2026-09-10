/**
 * The assignment doesn't call for a login system, but the wishlist still
 * needs to be scoped to "someone" rather than being one global list for
 * every visitor. The frontend generates a random device id once and
 * persists it in localStorage, sending it as this header on every
 * request. It's not authentication - it's a pragmatic stand-in that
 * keeps wishlists private per browser without building a full account
 * system out of scope for this task (documented in the README).
 */
module.exports = function deviceId(req, res, next) {
  const id = req.header('x-device-id');
  if (!id || typeof id !== 'string' || id.length > 100) {
    return res.status(400).json({ error: 'Missing or invalid X-Device-Id header' });
  }
  req.deviceId = id;
  next();
};
