const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Structured JSON logging middleware.
 * Logs each request on completion with timestamp, level, message,
 * requestId, method, path, statusCode, and duration (ms).
 */
function loggingMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id || 'unknown',
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration,
    };

    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(logData, message);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, message);
    } else {
      logger.info(logData, message);
    }
  });

  next();
}

module.exports = loggingMiddleware;
module.exports.logger = logger;
