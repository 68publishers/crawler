import { body, param, query } from 'express-validator';
import { validate } from 'node-cron';

export class ScenarioSchedulerValidator {
    #scenarioValidator;

    constructor({ scenarioValidator }) {
        this.#scenarioValidator = scenarioValidator;
    }

    getScenarioSchedulerValidator() {
        return [
            param('scenarioSchedulerId', 'The value must be a valid uuid.').isUUID(),
        ];
    }

    deleteScenarioSchedulerValidator() {
        return [
            param('scenarioSchedulerId', 'The value must be a valid uuid.').isUUID(),
        ];
    }

    listScenarioSchedulersValidator() {
        return [
            query('filter').optional().isObject(),
            query('filter.id').optional().isUUID(),
            query('limit').isInt({ min: 1 }),
            query('page').isInt({ min: 1 }),
        ];
    }

    createScenarioSchedulerValidator() {
        return [
            body('expression', 'The value must be valid crontab expression.').isString().bail().custom(expression => {
                return validate(expression);
            }),
            this.#scenarioValidator.postScenarioValidator(true),
        ]
    }

    updateScenarioSchedulerValidator() {
        return [
            param('scenarioSchedulerId', 'The value must be a valid uuid.').isUUID(),
            body('expression', 'The value must be valid crontab expression.').isString().bail().custom(expression => {
                return validate(expression);
            }),
            this.#scenarioValidator.postScenarioValidator(true),
        ]
    }
}
