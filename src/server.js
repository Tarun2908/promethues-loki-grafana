const app = require('./app');
const { logger } = require('./middleware/logging');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info({ port: PORT }, `LOS application listening on port ${PORT}`);
});
