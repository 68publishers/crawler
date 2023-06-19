import { AbstractAction } from './abstract-action.mjs';

export class Hover extends AbstractAction {
    constructor() {
        super('hover');
    }

    *_doValidateOptions({ options }) {
        if (!('selector' in options) || 'string' !== typeof options.selector || '' === options.selector) {
            yield 'the option "selector" is required and must be a non empty string';
        }
    }

    async execute(options, { page }) {
        await page.hover(options.selector);
    }
}
