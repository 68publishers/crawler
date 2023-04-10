import Winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {AbstractLogger} from './abstract-logger.mjs';

export class WinstonLogger extends AbstractLogger {
    constructor({ logDir, developmentMode }) {
        super();

        this.logger = Winston.createLogger({
            level: 'info',
            format: Winston.format.json(),
            transports: [
                new DailyRotateFile({
                    level: 'error',
                    filename: `${logDir}/error.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d'
                }),
                new DailyRotateFile({
                    level: 'warning',
                    filename: `${logDir}/warning.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d'
                }),
                new DailyRotateFile({
                    level: 'info',
                    filename: `${logDir}/info.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d'
                }),
            ],
        });

        if (developmentMode) {
            this.logger.add(new Winston.transports.Console({
                format: Winston.format.simple(),
            }));
        }
    }

    info(message) {
        this.logger.info(message);
    }

    warning(message) {
        this.logger.warning(message);
    }

    error(message) {
        this.logger.error(message);
    }
}
