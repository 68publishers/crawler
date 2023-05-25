import {AbstractLogger} from './abstract-logger.mjs';

export class JobLogger extends AbstractLogger {
    #job;

    constructor({ job }) {
        super();

        this.#job = job;
    }

    async info(message) {
        await this.#job.log(`Info: ${message}`);
    }

    async warning(message) {
        await this.#job.log(`Warning: ${message}`);
    }

    async error(message) {
        await this.#job.log(`Error: ${message}`);
    }
}
