export class ExecutionContext {
    constructor({
        request,
        page,
        scenarioId,
        enqueueLinks,
        saveResult,
        logger,
    }) {
        this.request = request;
        this.page = page;
        this.scenarioId = scenarioId;
        this.enqueueLinks = enqueueLinks;
        this.saveResult = saveResult;
        this.logger = logger;
    }
}
