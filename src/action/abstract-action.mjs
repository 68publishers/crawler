export class AbstractAction {
    constructor(name) {
        this.name = name;
    }

    // eslint-disable-next-line no-unused-vars
    *_doValidateOptions({ options, sceneNames }) {}

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

    // eslint-disable-next-line no-unused-vars
    async execute(options, executionContext) {
        throw new Error(`Method ${this.constructor.name}::execute() must be redeclared.`);
    }
}
