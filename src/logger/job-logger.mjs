import {AbstractLogger} from './abstract-logger.mjs';

export class JobLogger extends AbstractLogger {
    #job;

    constructor({ job }) {
        super();

        this.#job = job;
    }

    async info(message) {
        await this.#job.log(`[info]: ${message}`);
    }

    async warning(message) {
        await this.#job.log(`[warning]: ${this.#formatErrorMessage(message)}`);
    }

    async error(message) {
        await this.#job.log(`[error]: ${this.#formatErrorMessage(message)}`);
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
