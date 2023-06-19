export class ExecutionContext {
    #scenes;
    #actionRegistry;
    #afterActionExecutionCallback;

    constructor({
        request,
        page,
        scenarioId,
        scenarioOptions,
        enqueueLinks,
        enqueueLinksByClickingElements,
        saveResult,
        logger,
        browserController,
        scenes,
        actionRegistry,
        afterActionExecutionCallback,
    }) {
        this.request = request;
        this.page = page;
        this.scenarioId = scenarioId;
        this.scenarioOptions = scenarioOptions;
        this.enqueueLinks = enqueueLinks;
        this.enqueueLinksByClickingElements = enqueueLinksByClickingElements;
        this.saveResult = saveResult;
        this.logger = logger;
        this.browserController = browserController;
        this.#scenes = scenes;
        this.#actionRegistry = actionRegistry;
        this.#afterActionExecutionCallback = afterActionExecutionCallback;
    }

    async runScene(sceneName) {
        for (let action of (this.#scenes[sceneName] || [])) {
            await this.executeAction(action.action, action.options);
        }
    }

    async executeAction(actionName, options) {
        await this.#actionRegistry.get(actionName).execute(options, this);
        await this.#afterActionExecutionCallback(this);
    }
}
