const client = require('prom-client');

// Collect default Node.js metrics (event loop, heap, GC, etc.)
client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const httpRequestsActive = new client.Gauge({
  name: 'http_requests_active',
  help: 'Currently active HTTP requests',
});

/**
 * Prometheus metrics middleware.
 * Tracks http_requests_total (counter), http_request_duration_seconds
 * (histogram), and http_requests_active (gauge) for each request.
 */
function metricsMiddleware(req, res, next) {
  // Skip recording metrics for the /metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  httpRequestsActive.inc();
  const end = httpRequestDurationSeconds.startTimer({ method: req.method, path: req.route?.path || req.path });

  res.on('finish', () => {
    httpRequestsActive.dec();
    end();
    httpRequestsTotal.inc({
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode,
    });
  });

  next();
}

module.exports = metricsMiddleware;
module.exports.register = client.register;
module.exports.httpRequestsTotal = httpRequestsTotal;
module.exports.httpRequestDurationSeconds = httpRequestDurationSeconds;
module.exports.httpRequestsActive = httpRequestsActive;
