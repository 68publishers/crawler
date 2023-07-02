import Winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {AbstractLogger} from './abstract-logger.mjs';

const SentryTransport = (await import('winston-transport-sentry-node')).default;

export class WinstonLogger extends AbstractLogger {
    constructor({ logDir, developmentMode, sentryDsn, sentryServerName }) {
        super();

        const format = Winston.format;

        this.logger = Winston.createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss",
                }),
                format.json(),
            ),
            transports: [
                new DailyRotateFile({
                    level: 'error',
                    filename: `${logDir}/error.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '7d',
                }),
                new DailyRotateFile({
                    level: 'warn',
                    filename: `${logDir}/warning.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '7d',
                }),
                new DailyRotateFile({
                    level: 'info',
                    filename: `${logDir}/info.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '7d',
                }),
            ],
        });

        if (developmentMode) {
            this.logger.add(new Winston.transports.Console({
                format: format.simple(),
            }));
        }

        if ('string' === typeof sentryDsn) {
            this.logger.add(new SentryTransport.default({
                sentry: {
                    dsn: sentryDsn,
                    serverName: sentryServerName,
                },
                level: 'error',
                format: format.combine(
                    format.timestamp({
                        format: "YYYY-MM-DD HH:mm:ss",
                    }),
                    format.json(),
                    format.prettyPrint(),
                ),
            }));
        }
    }

    async info(message) {
        this.logger.info(message);
    }

    async warning(message) {
        this.logger.warn(this.#formatErrorMessage(message));
    }

    async error(message) {
        this.logger.error(this.#formatErrorMessage(message));
    }

    #formatErrorMessage(message) {
        if (message instanceof Error) {
            let errorMessage = message.toString();

            if (!errorMessage.endsWith('.')) {
                errorMessage += '.';
            }

            return `${errorMessage} Stack:\n${message.stack}`;
        }

        return message;
    }
}
