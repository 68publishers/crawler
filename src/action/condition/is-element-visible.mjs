import { AbstractCondition } from './abstract-condition.mjs';

export class IsElementVisible extends AbstractCondition {
    constructor() {
        super('isElementVisible');
    }

    *_doValidateOptions(options) {
        if (!('selector' in options) || 'string' !== typeof options.selector || '' === options.selector) {
            yield 'the option "selector" is required and must be a non empty string';
        }
    }

    async resolve(options, { page }) {
        return new Promise(resolve => {
            page.$(options.selector)
                ?.then(elementHandle => elementHandle?.boundingBox())
                ?.then(boundingBox => resolve(!!boundingBox))
                ?.catch(() => resolve(false));
        });
    }
}
