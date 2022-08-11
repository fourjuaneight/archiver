import pino from 'pino';
import pretty from 'pino-pretty';

const prettyStream = pretty({
  colorize: true,
});
const logger = pino(prettyStream);

export default logger;
