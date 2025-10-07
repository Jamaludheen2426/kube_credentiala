import { createLogger, format, transports } from 'winston';
import { LOG_LEVEL } from '../config/env';

const logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [new transports.Console()],
});

export default logger;
