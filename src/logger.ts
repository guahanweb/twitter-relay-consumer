import config from './config';
import { createLogger, format, transports } from 'winston';
import { TransformableInfo } from 'logform';
const { combine, splat, timestamp, printf } = format;

const myFormat = printf( ({ level, message, timestamp, ...metadata }: TransformableInfo) => {
    let msg = `${timestamp} [${level}] : ${message} `;
    if (metadata) {
        msg += JSON.stringify(metadata);
    }
    return msg;
});

const logger = createLogger({
    level: 'debug',
    format: combine(
        format.colorize(),
        splat(),
        timestamp(),
        myFormat,
    ),
    transports: [
        new transports.Console({ level: config.logLevel }),
    ]
});

export default logger;
