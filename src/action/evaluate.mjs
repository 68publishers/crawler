import { AbstractAction } from './abstract-action.mjs';

export class Evaluate extends AbstractAction {
    constructor() {
        super('evaluate');
    }

    *_doValidateOptions({ options }) {
        if (!('script' in options) || 'string' !== typeof options.script || '' === options.script) {
            yield 'the option "script" is required and must be a non empty string';
        }

        if ('failOnError' in options && 'boolean' !== typeof options.failOnError) {
            yield 'the optional option "failOnError" must be a bool';
        }

        if ('failOnFalsyReturn' in options && 'boolean' !== typeof options.failOnFalsyReturn) {
            yield 'the optional option "failFalsyReturn" must be a bool';
        }
    }

    async execute(options, { page }) {
        const failOnError = 'failOnError' in options ? options.failOnError : true;
        const failOnFalsyReturn = 'failOnFalsyReturn' in options ? options.failOnFalsyReturn : false;
        let hasError = false;
        let result;

        try {
            result = await page.evaluate(options.script);
        } catch (err) {
            if (failOnError) {
                if (!err.message.startsWith('Evaluation failed:')) {
                    err.message = `Evaluation failed: ${err.message}`;
                }

                throw err;
            }

            hasError = true;
        }

        if (failOnFalsyReturn && !hasError && !result) {
            throw new Error(`Evaluation failed: Script (${options.script}) returned a falsy result.`);
        }
    }
}
