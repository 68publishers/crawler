export class AbstractAction {
    constructor(name) {
        this.name = name;
    }

    *_doValidateOptions(options) {
        throw new Error(`Method ${this.constructor.name}::_doValidateOptions() must be redeclared.`);
    }

    validateOptions(options) {
        const errors = [];

        for (let error of this._doValidateOptions(options)) {
            errors.push(error);
        }

        if (0 < errors.length) {
            throw new Error(`Invalid options for the action "${this.name}": ${errors.join(', ')}.`);
        }

        return true;
    }

    async execute(options, { page, enqueueLinks, saveResult, scenarioId, logger }) {
        throw new Error(`Method ${this.constructor.name}::execute() must be redeclared.`);
    }
}
