import {AbstractAction} from './abstract-action.mjs';

export class Click extends AbstractAction {
    constructor() {
        super('click');
    }

    *_doValidateOptions(options) {
        if (!('selector' in options) || 'string' !== typeof options.selector || '' === options.selector) {
            yield 'the option "selector" is required and must be a non empty string';
        }

        if ('button' in options && !['left', 'right'].includes(options.button)) {
            yield 'the optional option "button" must have value "left" or "right.';
        }

        if ('clickCount' in options && (!Number.isInteger(options.clickCount) || 0 >= options.clickCount)) {
            yield 'the optional option "clickCount" must be a positive int';
        }

        if ('delay' in options && (!Number.isInteger(options.delay) || 0 > options.delay)) {
            yield 'the optional option "delay" must be an int greater or equal to 0';
        }

        if ('xpath' in options && 'boolean' !== typeof options.xpath) {
            yield 'the optional option "xpath" must be a bool';
        }
    }

    async execute(options, { page }) {
        const clickOptions = {
            button: options.button || 'left',
            clickCount: options.clickCount || 1,
            delay: options.delay || 0,
        };

        if (options.xpath) {
            const [button] = await page.$x(options.selector);
            await button.click(clickOptions);
        } else {
            await page.click(options.selector, clickOptions);
        }
    }
}
