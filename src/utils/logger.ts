import { createLogger, format, transports } from "winston";
const { combine } = format;

const log = createLogger({
  format: combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});

export default log;
