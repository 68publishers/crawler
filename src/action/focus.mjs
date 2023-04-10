import {AbstractAction} from './abstract-action.mjs';

export class Focus extends AbstractAction {
    constructor() {
        super('focus');
    }

    *_doValidateOptions(options) {
        if (!('selector' in options) || 'string' !== typeof options.selector || '' === options.selector) {
            yield 'the option "selector" is required and must be a non empty string';
        }
    }

    async execute(options, { page }) {
        await page.focus(options.selector);
    }
}
