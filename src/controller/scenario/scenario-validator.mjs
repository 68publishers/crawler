import { body, param, validationResult } from 'express-validator';

export class ScenarioValidator {
    #actionRegistry;

    constructor({ actionRegistry }) {
        this.#actionRegistry = actionRegistry;
    }

    getScenarioValidator() {
        return [
            param('scenarioId', 'The value must be a valid uuid.').isUUID(),
            (req, res, next) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(422).json({
                        errors: errors.array(),
                    });
                }

                next();
            }
        ];
    }

    postScenarioValidator() {
        const validateAction = (value) => {
            const action = value.action;
            const options = value.options;

            if ('string' !== typeof action || '' === action) {
                throw new Error('Action must be a non empty string.');
            }

            if (!options || 'object' !== typeof options) {
                throw new Error('Options must be an object.');
            }

            return this.#actionRegistry.get(action).validateOptions(options);
        }

        return [
            body('url', 'The value must be a valid URL.').isURL(),
            body('options.maxRequests', 'The value must be an int (>= 1) or undefined.').optional().isInt({ min: 1 }),
            body('options.viewport.width', 'The value must be an int (>= 200) or undefined.').optional().isInt({ min: 200 }),
            body('options.viewport.height', 'The value must be an int (>= 200) or undefined.').optional().isInt({ min: 200 }),
            body('startup', 'The value must be an array of actions.').optional().isArray(),
            body('forEach', 'The value must be an array of actions.').optional().isArray(),
            body('startup[*]').isObject().bail().custom(validateAction),
            body('forEach[*]').isObject().bail().custom(validateAction),
            (req, res, next) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(422).json({
                        errors: errors.array(),
                    });
                }

                next();
            }
        ];
    }
}
