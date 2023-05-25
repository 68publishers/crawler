import {AbstractLogger} from './abstract-logger.mjs';

export class LoggerChain extends AbstractLogger {
    #loggers;

    constructor({ loggers }) {
        super();

        this.#loggers = loggers;
    }

    async info(message) {
        for (let logger of this.#loggers) {
            await logger.info(message);
        }
    }

    async warning(message) {
        for (let logger of this.#loggers) {
            await logger.warning(message);
        }
    }

    async error(message) {
        for (let logger of this.#loggers) {
            await logger.error(message);
        }
    }
}
