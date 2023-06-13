import { AbstractAction } from './abstract-action.mjs';
import { ScenarioResultGroups } from '../model/scenario/scenario-result-groups.mjs';
import { placeholderReplacer } from '../helper/placeholder-replacer.mjs';

export class CollectData extends AbstractAction {
    constructor() {
        super('collectData');
    }

    static get STRATEGIES() {
        return [
            'static',
            'selector.innerText',
            'selector.attribute',
        ];
    }

    static get RESERVED_KEYS() {
        return [
            'identity',
            'foundOnUrl',
        ];
    }

    *_doValidateOptions({ options }) {
        for (let dataKey in options) {
            if (CollectData.RESERVED_KEYS.includes(dataKey)) {
                yield `the key "${dataKey}" is reserved for internal use, please choose a different key`;
            }

            const dataDef = options[dataKey];

            if ('object' !== typeof dataDef) {
                yield `the value of "${dataKey}" must be an object`;

                continue;
            }

            if (!('strategy' in dataDef) || 'string' !== typeof dataDef.strategy || !CollectData.STRATEGIES.includes(dataDef.strategy)) {
                yield `the option "${dataKey}.strategy" is required and must be one of these ["${CollectData.STRATEGIES.join('", "')}"]`;
            }

            if ('static' === dataDef.strategy) {
                if (!('value' in dataDef) || 'string' !== typeof dataDef.value || '' === dataDef.value) {
                    yield `the option "${dataKey}.value" is required for the static strategy and must be a non empty string`;
                }

                continue;
            }

            if (['selector.innerText', 'selector.attribute'].includes(dataDef.strategy) && (!('selector' in dataDef) || 'string' !== typeof dataDef.selector || '' === dataDef.selector)) {
                yield `the option "${dataKey}.selector" is required for the ${dataDef.strategy} strategy and must be a non empty string`;
            }

            if ('selector.attribute' === dataDef.strategy && (!('attribute' in dataDef) || 'string' !== typeof dataDef.attribute || '' === dataDef.attribute)) {
                yield `the option "${dataKey}.attribute" is required for the selector.attribute strategy and must be a non empty string`;
            }

            if ('multiple' in dataDef && 'boolean' !== typeof dataDef.multiple) {
                yield `the optional option "${dataKey}.multiple" must be a bool`;
            }
        }
    }

    async execute(options, { request, page, saveResult, logger }) {
        if (null === request.userData.identity) {
            await logger.error(new Error(`Unable to collect data with options ${JSON.stringify(options)}. Current identity is not set`));

            options = [];
        }

        const data = {
            values: {},
            foundOnUrl: {},
        };

        for (let dataKey in options) {
            const dataDef = options[dataKey];
            const value = await this.#getDataValue(dataDef, request, page);

            if (undefined === value) {
                await logger.warning(`Unable to collect value for "${request.userData.identity}"."${dataKey}"`);
            }

            data.values[dataKey] = value;
            data.foundOnUrl[dataKey] = request.userData.currentUrl;
        }

        if (1 < Object.keys(data).length) {
            await saveResult(ScenarioResultGroups.DATA, request.userData.identity, data, true);
        }
    }

    async #getDataValue(dataDef, request, page) {
        switch (dataDef.strategy) {
            case 'static':
                return await placeholderReplacer(dataDef.value, page);
            case 'selector.innerText':
                return await page.evaluate(dataDef => {
                    const elements = dataDef.multiple ? document.querySelectorAll(dataDef.selector) : [document.querySelector(dataDef.selector)];
                    const values = [];

                    for (let element of elements) {
                        if (null !== element) {
                            values.push(element.innerText);
                        }
                    }

                    return dataDef.multiple ? values : (0 < values.length ? values.shift() : undefined);
                }, dataDef);
            case 'selector.attribute':
                return await page.evaluate(dataDef => {
                    const elements = dataDef.multiple ? document.querySelectorAll(dataDef.selector) : [document.querySelector(dataDef.selector)];
                    const values = [];

                    for (let element of elements) {
                        if (null !== element && element.hasAttribute(dataDef.attribute)) {
                            values.push(element.getAttribute(dataDef.attribute));
                        }
                    }

                    return dataDef.multiple ? values : (0 < values.length ? values.shift() : undefined);
                }, dataDef);
            default:
                return undefined;
        }
    }
}
