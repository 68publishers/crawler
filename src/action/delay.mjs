import {AbstractAction} from './abstract-action.mjs';

export class Delay extends AbstractAction {
    constructor() {
        super('delay');
    }

    *_doValidateOptions({ options }) {
        if (!Number.isInteger(options.delay) || 0 > options.delay) {
            yield 'the option "delay" is required and must be a positive int';
        }
    }

    async execute(options, {}) {
        await new Promise(r => setTimeout(r, options.delay));
    }
}
