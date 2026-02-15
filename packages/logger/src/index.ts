import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${service || 'app'}] ${level}: ${stack || message}${metaStr}`;
});

export const createLogger = (service: string) => {
    return winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        defaultMeta: { service },
        format: combine(
            errors({ stack: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        ),
        transports: [
            new winston.transports.Console({
                format: combine(colorize(), logFormat),
            }),
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                format: combine(logFormat),
                maxsize: 5 * 1024 * 1024, // 5MB
                maxFiles: 5,
            }),
            new winston.transports.File({
                filename: 'logs/combined.log',
                format: combine(logFormat),
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5,
            }),
        ],
    });
};

// Default logger
export const logger = createLogger('studymate');

export default logger;
