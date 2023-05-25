import {AbstractAction} from './abstract-action.mjs';
import { EnqueueStrategy } from 'crawlee';

const strategies = [
    EnqueueStrategy.All,
    EnqueueStrategy.SameHostname,
    EnqueueStrategy.SameDomain,
    EnqueueStrategy.SameOrigin,
    'manual',
];

export class EnqueueLinks extends AbstractAction {
    constructor() {
        super('enqueueLinks');
    }

    *_doValidateOptions(options) {
        if (!('strategy' in options) || 'string' !== typeof options.strategy || !strategies.includes(options.strategy)) {
            yield `the option "strategy" is required and must be one of these ["${strategies.join('", "')}"]`;
        }

        if ('manual' === options.strategy) {
            if (!('urls' in options) || (!Array.isArray(options.urls) || 0 < options.urls.filter(e => 'string' !== typeof e))) {
                yield `the option "urls" is required for the manual strategy and must be an array of urls.`;
            }
        } else {
            if ('selector' in options && 'string' !== typeof options.selector) {
                yield 'the optional option "selector" must be a string';
            }

            if ('exclude' in options && (!Array.isArray(options.exclude) || 0 < options.exclude.filter(e => 'string' !== typeof e))) {
                yield 'the optional option "exclude" must be an array of regular expressions';
            }

            if ('limit' in options && (!Number.isInteger(options.limit) || 0 >= options.limit)) {
                yield 'the optional option "limit" must be a positive int';
            }
        }
    }

    async execute(options, { page, enqueueLinks }) {
        await enqueueLinks(this.#createEnqueueLinksOptions(page, options));
    }

    #createEnqueueLinksOptions(page, options) {
        if ('manual' === options.strategy) {
            return {
                urls: options.urls,
                label: 'FOR_EACH',
            };
        }

        const enqueueLinksOptions = {
            strategy: options.strategy,
            label: 'FOR_EACH',
            baseUrl: (new URL(page.url())).origin,
        };

        if ('selector' in options) {
            enqueueLinksOptions.selector = options.selector;
        }

        if ('exclude' in options) {
            enqueueLinksOptions.exclude = options.exclude.map(pattern => new RegExp(pattern.toString()));
        }

        if ('limit' in options) {
            enqueueLinksOptions.limit = options.limit;
        }

        return enqueueLinksOptions;
    }
}
