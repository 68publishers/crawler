import {AbstractAction} from './abstract-action.mjs';

export class Screenshot extends AbstractAction {
    constructor() {
        super('screenshot');
    }

    *_doValidateOptions(options) {
        if (!('name' in options) || 'string' !== typeof options.name || '' === options.name) {
            yield 'the option "name" is required and must be a non empty string';
        }
    }

    async execute(options, { page, saveSnapshot }) {
        await saveSnapshot({
            key: options.name.replace('%url%', page.url().replace(/[^a-zA-Z0-9!\-_.'()]/g, '-')),
            saveScreenshot: true,
            saveHtml: false,
        });
    }
}
