import {Router} from 'express';

export class RouterFactory {
    #scenarioController;
    #scenarioValidator;

    constructor({
        scenarioController,
        scenarioValidator,
    }) {
        this.#scenarioController = scenarioController;
        this.#scenarioValidator = scenarioValidator;
    }

    create() {
        const router = Router();
        const apiRouter = Router();
        const scenarioRouter = Router();

        router.use('/api', apiRouter);
        apiRouter.use('/scenario', scenarioRouter);

        scenarioRouter.get('/:scenarioId', this.#scenarioValidator.getScenarioValidator(), this.#scenarioController.getScenario.bind(this.#scenarioController));
        scenarioRouter.post('/', this.#scenarioValidator.postScenarioValidator(), this.#scenarioController.scheduleScenario.bind(this.#scenarioController));

        return router;
    }
}
