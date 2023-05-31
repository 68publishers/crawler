export class AbstractLogger {
    // eslint-disable-next-line no-unused-vars
    async info(message) {
        this.#throwMissingImplementationError('info');
    }

    // eslint-disable-next-line no-unused-vars
    async warning(message) {
        this.#throwMissingImplementationError('warning');
    }

    // eslint-disable-next-line no-unused-vars
    async error(message) {
        this.#throwMissingImplementationError('error');
    }

    #throwMissingImplementationError(methodName) {
        throw new Error(`Method ${this.constructor.name}::${methodName}() must be redeclared.`);
    }
}
