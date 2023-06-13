import { AbstractAction } from './abstract-action.mjs';
import { placeholderReplacer } from '../helper/placeholder-replacer.mjs';

export class SetIdentity extends AbstractAction {
    constructor() {
        super('setIdentity');
    }

    static get STRATEGIES() {
        return [
            'static',
            'selector.innerText',
            'selector.attribute',
        ];
    }

    *_doValidateOptions({ options }) {
        if (!('strategy' in options) || 'string' !== typeof options.strategy || !SetIdentity.STRATEGIES.includes(options.strategy)) {
            yield `the option "strategy" is required and must be one of these ["${SetIdentity.STRATEGIES.join('", "')}"]`;
        }

        if ('static' === options.strategy && (!('identity' in options) || 'string' !== typeof options.identity || '' === options.identity)) {
            yield `the option "identity" is required for the static strategy and must be a non empty string`;
        }

        if (['selector.innerText', 'selector.attribute'].includes(options.strategy) && (!('selector' in options) || 'string' !== typeof options.selector || '' === options.selector)) {
            yield `the option "selector" is required for the ${options.strategy} strategy and must be a non empty string`;
        }

        if ('selector.attribute' === options.strategy && (!('attribute' in options) || 'string' !== typeof options.attribute || '' === options.attribute)) {
            yield `the option "attribute" is required for the selector.attribute strategy and must be a non empty string`;
        }
    }

    async execute(options, { request, page, logger }) {
        let identity = null;

        switch (options.strategy) {
            case 'static':
                identity = await placeholderReplacer(options.identity, page);
                break;
            case 'selector.innerText':
                identity = await page.evaluate(options => {
                    const element = document.querySelector(options.selector);

                    return null !== element ? element.innerText : null;
                }, options);
                break;
            case 'selector.attribute':
                identity = await page.evaluate(options => {
                    const element = document.querySelector(options.selector);

                    return null === element || !element.hasAttribute(options.attribute) ? null : element.getAttribute(options.attribute);
                }, options);
                break;
        }

        if (null === identity) {
            await logger.error(new Error(`Unable to set identity with options ${JSON.stringify(options)}. Data will not be collected`));
        }

        request.userData.identity = identity;
    }
}
