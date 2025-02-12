import app from './app.js';
import config from './src/config/config.js';
import logger from './src/config/logger.js';

const { port } = config;

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});