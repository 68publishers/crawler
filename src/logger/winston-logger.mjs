import Winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {AbstractLogger} from './abstract-logger.mjs';

export class WinstonLogger extends AbstractLogger {
    constructor({ logDir, developmentMode }) {
        super();

        this.logger = Winston.createLogger({
            level: 'info',
            format: Winston.format.combine(
                Winston.format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss",
                }),
                Winston.format.json(),
            ),
            transports: [
                new DailyRotateFile({
                    level: 'error',
                    filename: `${logDir}/error.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d',
                }),
                new DailyRotateFile({
                    level: 'warn',
                    filename: `${logDir}/warning.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d',
                }),
                new DailyRotateFile({
                    level: 'info',
                    filename: `${logDir}/info.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d',
                }),
            ],
        });

        if (developmentMode) {
            this.logger.add(new Winston.transports.Console({
                format: Winston.format.simple(),
            }));
        }
    }

    async info(message) {
        this.logger.info(message);
    }

    async warning(message) {
        this.logger.warn(message);
    }

    async error(message) {
        this.logger.error(message);
    }
}
