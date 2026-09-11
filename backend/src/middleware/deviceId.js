module.exports = function deviceId(req, res, next) {
  const id = req.header('x-device-id');
  if (!id || typeof id !== 'string' || id.length > 100) {
    return res.status(400).json({ error: 'Missing or invalid X-Device-Id header' });
  }
  req.deviceId = id;
  next();
};
