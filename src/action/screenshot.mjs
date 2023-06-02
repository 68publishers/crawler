import { AbstractAction } from './abstract-action.mjs';
import { placeholderReplacer } from '../helper/placeholder-replacer.mjs';
import { ScenarioResultGroups } from '../model/scenario/scenario-result-groups.mjs';
import { v4 as uuid } from 'uuid';
import { existsSync, mkdirSync } from 'node:fs';
import { URL } from 'node:url';

export class Screenshot extends AbstractAction {
    #applicationUrl;

    constructor({ applicationUrl }) {
        super('screenshot');

        this.#applicationUrl = applicationUrl;
    }

    *_doValidateOptions({ options }) {
        if (!('name' in options) || 'string' !== typeof options.name || '' === options.name) {
            yield 'the option "name" is required and must be a non empty string';
        }
    }

    async execute(options, { request, page, saveResult, scenarioId }) {
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
            captureBeyondViewport: false,
        });

        const currentUrl = request.userData.currentUrl;
        const screenshotUrl = new URL(this.#applicationUrl);
        screenshotUrl.pathname = `static/screenshots/${scenarioId}/${screenshotId}.jpg`

        await saveResult(ScenarioResultGroups.SCREENSHOTS, screenshotId, {
            name: await placeholderReplacer(options.name, page),
            screenshot: screenshotUrl.toString(),
            foundOnUrl: currentUrl,
        }, false);
    }
}
