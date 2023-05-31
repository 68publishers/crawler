import { validationResult } from "express-validator";
import { paginatedResultMiddleware } from '../middleware/paginated-result-middleware.mjs';
import etag from 'etag';

export class ScenarioSchedulerController {
    #scenarioSchedulerRepository;
    #scenarioSchedulerValidator;
    #scheduler;

    constructor({ scenarioSchedulerRepository, scenarioSchedulerValidator, scheduler }) {
        this.#scenarioSchedulerRepository = scenarioSchedulerRepository;
        this.#scenarioSchedulerValidator = scenarioSchedulerValidator;
        this.#scheduler = scheduler;
    }

    createScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.createScenarioSchedulerValidator(),
            async (req, res) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        errors: errors.array(),
                    });
                }

                const userId = req.user.id;
                const { name, flags, config, expression } = req.body;

                const scenarioSchedulerId = await this.#scenarioSchedulerRepository.create(userId, name, flags || {}, expression, config);

                await this.#scheduler.refresh();

                const scenarioScheduler = await this.#scenarioSchedulerRepository.get(scenarioSchedulerId);

                res.status(201)
                    .header('ETag', etag(JSON.stringify(scenarioScheduler), {
                        weak: false,
                    }))
                    .header('Location', `${req.originalUrl}/${scenarioSchedulerId}`)
                    .json(scenarioScheduler);
            },
        ];
    }

    updateScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.updateScenarioSchedulerValidator(),
            async (req, res) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        errors: errors.array(),
                    });
                }

                const scenarioSchedulerId = req.params.scenarioSchedulerId;
                const userId = req.user.id;
                const { name, flags, config, expression } = req.body;
                let scenarioScheduler = await this.#scenarioSchedulerRepository.get(scenarioSchedulerId);

                if (null !== scenarioScheduler) {
                    const ifMatch = req.header('if-match');

                    if (!ifMatch) {
                        return res.status(428).end();
                    }

                    const entityTag = etag(JSON.stringify(scenarioScheduler), {
                        weak: false,
                    });

                    if (entityTag !== ifMatch) {
                        return res.status(412).end();
                    }

                    await this.#scenarioSchedulerRepository.update(scenarioSchedulerId, userId, name, flags || {}, expression, config);

                    res.status(200);
                } else {
                    await this.#scenarioSchedulerRepository.create(userId, name, flags || {}, expression, config, scenarioSchedulerId);

                    res.status(201)
                        .header('Location', `${req.originalUrl}/${scenarioSchedulerId}`);
                }

                await this.#scheduler.refresh();

                scenarioScheduler = await this.#scenarioSchedulerRepository.get(scenarioSchedulerId);

                res.header('ETag', etag(JSON.stringify(scenarioScheduler), {
                    weak: false,
                })).json(scenarioScheduler);
            },
        ];
    }

    validateScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.createScenarioSchedulerValidator(),
            async (req, res) => {
                const errors = validationResult(req);

                res.status(200).json({
                    valid: errors.isEmpty(),
                    errors: errors.array(),
                });
            },
        ];
    }

    listScenarioSchedulers() {
        return [
            ...this.#scenarioSchedulerValidator.listScenarioSchedulersValidator(),
            paginatedResultMiddleware(
                this.#scenarioSchedulerRepository.count.bind(this.#scenarioSchedulerRepository),
                this.#scenarioSchedulerRepository.list.bind(this.#scenarioSchedulerRepository),
            ),
        ];
    }

    deleteScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.deleteScenarioSchedulerValidator(),
            async (req, res) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        errors: errors.array(),
                    });
                }

                if (!(await this.#scenarioSchedulerRepository.delete(req.params.scenarioSchedulerId))) {
                    res.status(404).json({
                        error: 'Scenario scheduler not found.',
                    });

                    return;
                }
                await this.#scheduler.refresh();

                res.status(204).end();
            },
        ];
    }

    getScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.getScenarioSchedulerValidator(),
            async (req, res) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        errors: errors.array(),
                    });
                }

                const scenarioScheduler = await this.#scenarioSchedulerRepository.get(req.params.scenarioSchedulerId);

                if (null === scenarioScheduler) {
                    res.status(404).json({
                        error: 'Scenario scheduler not found.',
                    });

                    return;
                }

                res.status(200)
                    .header('ETag', etag(JSON.stringify(scenarioScheduler), {
                        weak: false,
                    }))
                    .json(scenarioScheduler);
            },
        ];
    }
}
