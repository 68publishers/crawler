import {AbstractAction} from './abstract-action.mjs';
import { EnqueueStrategy } from 'crawlee';

const strategies = [
    EnqueueStrategy.All,
    EnqueueStrategy.SameHostname,
    EnqueueStrategy.SameDomain,
    EnqueueStrategy.SameOrigin,
];

export class EnqueueLinks extends AbstractAction {
    constructor() {
        super('enqueueLinks');
    }

    *_doValidateOptions(options) {
        if (!('strategy' in options) || 'string' !== typeof options.strategy || !strategies.includes(options.strategy)) {
            yield `the option "strategy" is required and must be one of these ["${strategies.join('", "')}"]`;
        }

        if ('exclude' in options && (!Array.isArray(options.exclude) || 0 < options.exclude.filter(e => 'string' !== typeof e))) {
            yield 'the optional option "exclude" must be an array of regular expressions';
        }

        if ('limit' in options && (!Number.isInteger(options.limit) || 0 >= options.limit)) {
            yield 'the optional option "limit" must be a positive int';
        }
    }

    async execute(options, { page, enqueueLinks }) {
        const enqueueLinksOptions = {
            selector: 'a',
            strategy: options.strategy,
            label: 'FOR_EACH',
            baseUrl: (new URL(page.url())).origin,
        };

        if ('exclude' in options) {
            enqueueLinksOptions.exclude = options.exclude;
        }

        if ('limit' in options) {
            enqueueLinksOptions.limit = options.limit;
        }

        await enqueueLinks(enqueueLinksOptions);
    }
}
