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
            query('filter', 'The value must be an object.').optional().isObject(),
            query('filter.id', 'The value must be a valid uuid.').optional().isUUID(),
            query('filter.userId', 'The value must be a valid uuid.').optional().isUUID(),
            query('filter.username', 'The value must be a string.').optional().isString(),
            query('filter.name', 'The value must be a string').optional().isString(),
            query('filter.flags', 'The valid must be an object with string values.').optional().isObject(),
            query('limit', 'The value must be int that is greater than or equal to 1.').isInt({ min: 1 }),
            query('page', 'The value must be int that is greater than or equal to 1.').isInt({ min: 1 }),
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
