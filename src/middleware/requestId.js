const crypto = require('crypto');

/**
 * Middleware that generates a UUID v4 request ID, attaches it to the
 * request object, and sets the X-Request-Id response header.
 */
function requestId(req, res, next) {
  const id = crypto.randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

module.exports = requestId;
