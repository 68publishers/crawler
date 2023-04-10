import {AbstractAction} from './abstract-action.mjs';

export class KeyboardPress extends AbstractAction {
    constructor() {
        super('keyboardPress');
    }

    *_doValidateOptions(options) {
        if (!('key' in options) || 'string' !== typeof options.key || '' === options.key) {
            yield 'the option "key" is required and must be a non empty string';
        }
    }

    async execute(options, { page }) {
        await page.keyboard.press(options.key);
    }
}
