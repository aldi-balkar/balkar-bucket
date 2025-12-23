import morgan from 'morgan';
import logger from '../config/logger';

// Custom morgan stream
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Custom morgan format
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

export default morganMiddleware;
