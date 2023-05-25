export class AbstractLogger {
    async info(message) {
        this.#throwMissingImplementationError('info');
    }

    async warning(message) {
        this.#throwMissingImplementationError('warning');
    }

    async error(message) {
        this.#throwMissingImplementationError('error');
    }

    #throwMissingImplementationError(methodName) {
        throw new Error(`Method ${this.constructor.name}::${methodName}() must be redeclared.`);
    }
}
