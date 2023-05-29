import {AbstractAction} from './abstract-action.mjs';

export class ClickWithRedirect extends AbstractAction {
    constructor() {
        super('clickWithRedirect');
    }

    *_doValidateOptions({ options }) {
        if (!('selector' in options) || 'string' !== typeof options.selector || '' === options.selector) {
            yield 'the option "selector" is required and must be a non empty string';
        }

        if ('delay' in options && (!Number.isInteger(options.delay) || 0 > options.delay)) {
            yield 'the optional option "delay" must be an int greater or equal to 0';
        }

        if ('xpath' in options && 'boolean' !== typeof options.xpath) {
            yield 'the optional option "xpath" must be a bool';
        }
    }

    async execute(options, { page }) {
        if (options.xpath) {
            const [button] = await page.$x(options.selector);
            await Promise.all([
                page.waitForNavigation({
                    waitUntil: 'networkidle0',
                }),
                button.click({
                    delay: options.delay || 0,
                }),
            ]);
        } else {
            await Promise.all([
                page.waitForNavigation({
                    waitUntil: 'networkidle0',
                }),
                page.click(options.selector, {
                    delay: options.delay || 0,
                }),
            ]);
        }
    }
}
