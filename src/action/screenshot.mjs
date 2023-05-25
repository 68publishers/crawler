import { AbstractAction } from './abstract-action.mjs';
import { v4 as uuid } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { URL } from 'url';

export class Screenshot extends AbstractAction {
    #applicationUrl;

    constructor({ applicationUrl }) {
        super('screenshot');

        this.#applicationUrl = applicationUrl;
    }

    *_doValidateOptions(options) {
        if (!('name' in options) || 'string' !== typeof options.name || '' === options.name) {
            yield 'the option "name" is required and must be a non empty string';
        }
    }

    async execute(options, { page, saveResult, scenarioId }) {
        const screenshotId = uuid();
        const directory = `public/screenshots/${scenarioId}`;

        if (!existsSync(directory)) {
            mkdirSync(directory, {
                recursive: true,
            });
        }

        await page.screenshot({
            quality: 100,
            path: `${directory}/${screenshotId}.jpg`,
        });

        const pageUrl = page.url();
        const screenshotUrl = new URL(this.#applicationUrl);
        screenshotUrl.pathname = `static/screenshots/${scenarioId}/${screenshotId}.jpg`

        await saveResult('screenshots', screenshotId, {
            name: options.name.replace('%url%', pageUrl),
            screenshotUrl: screenshotUrl.toString(),
            pageUrl: pageUrl,
        }, false);
    }
}
