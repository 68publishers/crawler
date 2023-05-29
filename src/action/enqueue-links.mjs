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

    *_doValidateOptions({ options, sceneNames }) {
        if (!('strategy' in options) || 'string' !== typeof options.strategy || !strategies.includes(options.strategy)) {
            yield `the option "strategy" is required and must be one of these ["${strategies.join('", "')}"]`;
        }

        if (('scene' in options) && 'string' === typeof options.scene) {
            if (!sceneNames.includes(options.scene)) {
                yield `the option "scene" contains undefined scene name "${options.scene}"`;
            }
        } else {
            yield `the option "scene" is required and must be a scene name`;
        }

        if ('manual' === options.strategy) {
            if (!('urls' in options) || (!Array.isArray(options.urls) || 0 < options.urls.filter(e => 'string' !== typeof e))) {
                yield `the option "urls" is required for the manual strategy and must be an array of urls`;
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

        if ('baseUrl' in options && 'string' !== typeof options.baseUrl) {
            yield 'the optional option "baseUrl" must be a string';
        }
    }

    async execute(options, { request, page, enqueueLinks }) {
        await enqueueLinks(
            await this.#createEnqueueLinksOptions(request, page, options)
        );
    }

    async #createEnqueueLinksOptions(request, page, options) {
        const previousCookies = await page.cookies();

        if ('manual' === options.strategy) {
            return {
                urls: options.urls,
                userData: {
                    scene: options.scene,
                    previousCookies: previousCookies,
                    previousUrl: request.userData.currentUrl,
                    identity: request.userData.identity,
                },
            };
        }

        const enqueueLinksOptions = {
            strategy: options.strategy,
            userData: {
                scene: options.scene,
                previousCookies: previousCookies,
                previousUrl: request.userData.currentUrl,
                identity: request.userData.identity,
            },
            baseUrl: options.baseUrl || (new URL(page.url())).origin,
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
