import {AbstractAction} from './abstract-action.mjs';

export class WaitForSelector extends AbstractAction {
    constructor() {
        super('waitForSelector');
    }

    *_doValidateOptions(options) {
        if (!('selector' in options) || 'string' !== typeof options.selector || '' === options.selector) {
            yield 'the option "selector" is required and must be a non empty string';
        }

        if ('hidden' in options && 'boolean' !== typeof options.hidden) {
            yield 'the optional option "hidden" must be a bool';
        }

        if ('visible' in options && 'boolean' !== typeof options.visible) {
            yield 'the optional option "visible" must be a bool';
        }
    }

    async execute(options, { page }) {
        const waitOptions = {};

        if ('hidden' in options) {
            waitOptions.hidden = options.hidden;
        }

        if ('visible' in options) {
            waitOptions.visible = options.visible;
        }

        await page.waitForSelector(options.selector, waitOptions);
    }
}
