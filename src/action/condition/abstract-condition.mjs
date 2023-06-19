export class AbstractCondition {
    constructor(name) {
        this.name = name;
    }

    // eslint-disable-next-line no-unused-vars
    *_doValidateOptions(options) {}

    validateOptions(options) {
        const errors = [];

        for (let error of this._doValidateOptions(options)) {
            errors.push(error);
        }

        return errors;
    }

    // eslint-disable-next-line no-unused-vars
    async resolve(options, executionContext) {
        throw new Error(`Method ${this.constructor.name}::execute() must be redeclared.`);
    }
}
