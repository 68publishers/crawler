export class ExecutionContext {
    constructor({
        request,
        page,
        scenarioId,
        enqueueLinks,
        enqueueLinksByClickingElements,
        saveResult,
        logger,
    }) {
        this.request = request;
        this.page = page;
        this.scenarioId = scenarioId;
        this.enqueueLinks = enqueueLinks;
        this.enqueueLinksByClickingElements = enqueueLinksByClickingElements;
        this.saveResult = saveResult;
        this.logger = logger;
    }
}
