export class ExecutionContext {
    constructor({
        request,
        page,
        scenarioId,
        enqueueLinks,
        saveResult,
        logger,
    }) {
        Object.assign(this, arguments[0]);
    }
}
