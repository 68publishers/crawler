export class AbstractLogger {
    info(message) {
        this.#throwMissingImplementationError('info');
    }

    warning(message) {
        this.#throwMissingImplementationError('warning');
    }

    error(message) {
        this.#throwMissingImplementationError('error');
    }

    #throwMissingImplementationError(methodName) {
        throw new Error(`Method ${this.constructor.name}::${methodName}() must be redeclared.`);
    }
}
