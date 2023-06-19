import { AbstractAction } from './abstract-action.mjs';
import { ConditionRegistry } from './condition/condition-registry.mjs';

export class RunSceneConditionally extends AbstractAction {
    #conditionRegistry;

    constructor() {
        super('runSceneConditionally');

        this.#conditionRegistry = new ConditionRegistry();
    }

    *_doValidateOptions({ options, sceneNames }) {
        if (!('condition' in options)) {
            yield `the option "condition" is required and must be an object that represents a condition`;
        } else {
            const conditionConfiguration = options.condition;

            if ('object' !== typeof conditionConfiguration || 'string' !== typeof conditionConfiguration.type || 'object' !== typeof conditionConfiguration.options) {
                yield `the option "condition" must be object with fields "type" (string) and "options" (object)`;
            } else {
                const condition = this.#conditionRegistry.get(conditionConfiguration.type);

                for (let err of condition.validateOptions(conditionConfiguration.options)) {
                    yield err;
                }
            }
        }

        if (('thenRun' in options) && 'string' === typeof options.thenRun) {
            if (!sceneNames.includes(options.thenRun)) {
                yield `the option "thenRun" contains undefined scene name "${options.thenRun}"`;
            }
        } else {
            yield `the option "thenRun" is required and must be a scene name`;
        }

        if (('elseRun' in options) && ('string' !== typeof options.elseRun || !sceneNames.includes(options.elseRun))) {
            yield `the optional option "elseRun" contains undefined scene name "${options.elseRun.toString()}"`;
        }
    }

    async execute(options, executionContext) {
        const conditionConfig = options.condition;
        let sceneName;

        if (await this.#conditionRegistry.get(conditionConfig.type).resolve(conditionConfig.options, executionContext)) {
            sceneName = options.thenRun;
        } else if ('string' === typeof options.elseRun) {
            sceneName = options.elseRun;
        }

        if (sceneName) {
            executionContext.logger.info(`Running sub-scene "${sceneName}" for URL ${executionContext.request.userData.currentUrl}`);

            await executionContext.runScene(sceneName);
        }
    }
}
