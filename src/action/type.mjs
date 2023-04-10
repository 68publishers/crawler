import {AbstractAction} from './abstract-action.mjs';

export class Type extends AbstractAction {
    constructor() {
        super('type');
    }

    *_doValidateOptions(options) {
        if (!('selector' in options) || 'string' !== typeof options.selector || '' === options.selector) {
            yield 'the option "selector" is required and must be a non empty string';
        }

        if (!('value' in options) || 'string' !== typeof options.value) {
            yield 'the option "value" is required and must be a string';
        }

        if ('delay' in options && (!Number.isInteger(options.delay) || 0 > options.delay)) {
            yield 'the optional option "delay" must be an int greater or equal to 0';
        }
    }

    async execute(options, { page }) {
        await page.type(options.selector, options.value, {
            delay: options.delay || 0,
        });
    }
}
