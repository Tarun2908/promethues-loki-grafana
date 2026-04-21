const express = require('express');
const requestId = require('./middleware/requestId');
const loggingMiddleware = require('./middleware/logging');
const { logger } = require('./middleware/logging');
const metricsMiddleware = require('./middleware/metrics');
const { register } = require('./middleware/metrics');
const loanRoutes = require('./routes/loans');

const app = express();

// --- Middleware registration ---
app.use(express.json());
app.use(requestId);
app.use(loggingMiddleware);
app.use(metricsMiddleware);

// --- Health check endpoint ---
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// --- Prometheus metrics endpoint ---
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.status(200).send(await register.metrics());
});

// --- Loan routes ---
app.use('/api/loans', loanRoutes);

// --- Error-handling middleware ---

// Malformed JSON from express.json() produces a SyntaxError with status 400
app.use((err, req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: 'Invalid JSON in request body',
    });
  }

  // Unhandled errors — log full details, return sanitized response
  logger.error(
    {
      requestId: req.id || 'unknown',
      method: req.method,
      path: req.originalUrl,
      stack: err.stack,
    },
    err.message || 'Internal server error'
  );

  return res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
});

module.exports = app;
