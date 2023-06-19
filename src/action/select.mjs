import { AbstractAction } from './abstract-action.mjs';

export class Select extends AbstractAction {
    constructor() {
        super('select');
    }

    *_doValidateOptions({ options }) {
        if (!('selector' in options) || 'string' !== typeof options.selector || '' === options.selector) {
            yield 'the option "selector" is required and must be a non empty string';
        }

        if (!('value' in options) || 'string' !== typeof options.value) {
            yield 'the option "value" is required and must be a string';
        }
    }

    async execute(options, { page }) {
        await page.select(options.selector, options.value);
    }
}
