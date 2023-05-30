import { body, param, query } from 'express-validator';

export class ScenarioValidator {
    #actionRegistry;

    constructor({ actionRegistry }) {
        this.#actionRegistry = actionRegistry;
    }

    getScenarioValidator() {
        return [
            param('scenarioId', 'The value must be a valid uuid.').isUUID(),
        ];
    }

    listScenariosValidator() {
        return [
            query('filter').optional().isObject(),
            query('filter.id').optional().isUUID(),
            query('filter.status').optional().isString(),
            query('limit').isInt({ min: 1 }),
            query('page').isInt({ min: 1 }),
        ];
    }

    postScenarioValidator(callbackUriRequired = false) {
        let sceneNames = [];

        const validateAction = value => {
            const action = value.action;
            const options = value.options;

            if ('string' !== typeof action || '' === action) {
                throw new Error('Action must be a non empty string.');
            }

            if (!options || 'object' !== typeof options) {
                throw new Error('Options must be an object.');
            }

            return this.#actionRegistry.get(action).validateOptions({ options, sceneNames });
        }

        return [
            callbackUriRequired
                ? body('callbackUri', 'The value must be a valid URL.').isURL()
                : body('callbackUri', 'The value must be a valid URL.').optional().isURL(),
            body('options.maxRequests', 'The value must be an int (>= 1) or undefined.').optional().isInt({ min: 1 }),
            body('options.maxRequestRetries', 'The value must be an int (>= 0) or undefined.').optional().isInt({ min: 0 }),
            body('options.viewport.width', 'The value must be an int (>= 200) or undefined.').optional().isInt({ min: 200 }),
            body('options.viewport.height', 'The value must be an int (>= 200) or undefined.').optional().isInt({ min: 200 }),
            body('scenes', 'The value must be a non empty object with string keys.').isObject().bail().custom(scenes => {
                sceneNames = Object.keys(scenes);

                return 0 < sceneNames.length && sceneNames.filter(k => 'string' === typeof k).length === sceneNames.length;
            }),
            body('scenes[*]').isArray().notEmpty(),
            body('scenes[*][*]').isObject().bail().custom(validateAction),
            body('entrypoint.url', 'The value must be a valid URL.').isURL(),
            body('entrypoint.scene', 'The value must be a string.').isString().bail().custom(scene => {
                if (!sceneNames.includes(scene)) {
                    throw new Error(`Scene with the name "${scene}" is not defined.`);
                }

                return true;
            }),
        ];
    }
}
