import {AbstractLogger} from '../../../src/logger/abstract-logger.mjs';

export class InMemoryLogger extends AbstractLogger {
    constructor() {
        super();

        this.messages = [];
    }

    async info(message) {
        this.messages.push({
            verbosity: 'info',
            message: message instanceof Error ? message.message : message.toString(),
        })
    }

    async warning(message) {
        this.messages.push({
            verbosity: 'warning',
            message: message instanceof Error ? message.message : message.toString(),
        })
    }

    async error(message) {
        this.messages.push({
            verbosity: 'error',
            message: message instanceof Error ? message.message : message.toString(),
        })
    }
}
