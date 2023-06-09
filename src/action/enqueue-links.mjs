import { AbstractAction } from './abstract-action.mjs';
import { EnqueueStrategy } from 'crawlee';
import { placeholderReplacer } from '../helper/placeholder-replacer.mjs';

export class EnqueueLinks extends AbstractAction {
    constructor() {
        super('enqueueLinks');
    }

    static get STRATEGIES() {
        return [
            EnqueueStrategy.All,
            EnqueueStrategy.SameHostname,
            EnqueueStrategy.SameDomain,
            EnqueueStrategy.SameOrigin,
            'manual',
        ];
    }

    *_doValidateOptions({ options, sceneNames }) {
        if (!('strategy' in options) || 'string' !== typeof options.strategy || !EnqueueLinks.STRATEGIES.includes(options.strategy)) {
            yield `the option "strategy" is required and must be one of these ["${EnqueueLinks.STRATEGIES.join('", "')}"]`;
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

            if ('baseUrl' in options && 'string' !== typeof options.baseUrl) {
                yield 'the optional option "baseUrl" must be a string';
            }
        }
    }

    async execute(options, { scenarioOptions, request, page, enqueueLinks, browserController }) {
        await enqueueLinks(
            await this.#createEnqueueLinksOptions(
                request,
                page,
                browserController,
                options,
                ('session' in scenarioOptions && 'transferredCookies' in scenarioOptions.session) ? scenarioOptions.session.transferredCookies : [],
            ),
        );
    }

    async #createEnqueueLinksOptions(request, page, browserController, options, transferredCookieNames) {
        let transferredCookies = [];

        if (Array.isArray(transferredCookieNames) && 0 < transferredCookieNames.length) {
            const cookies = (await browserController.getCookies(page))
                .filter(cookie => transferredCookieNames.includes(cookie.name));

            if (0 < cookies.length) {
                transferredCookies = cookies;
            }
        }

        if ('manual' === options.strategy) {
            return {
                urls: options.urls,
                userData: {
                    scene: options.scene,
                    previousUrl: request.userData.currentUrl,
                    identity: request.userData.identity,
                    transferredCookies: transferredCookies,
                },
            };
        }

        const enqueueLinksOptions = {
            strategy: options.strategy,
            userData: {
                scene: options.scene,
                previousUrl: request.userData.currentUrl,
                identity: request.userData.identity,
                transferredCookies: transferredCookies,
            },
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

        if ('baseUrl' in options) {
            enqueueLinksOptions.baseUrl = (await placeholderReplacer(options.baseUrl, page));
        }

        return enqueueLinksOptions;
    }
}
