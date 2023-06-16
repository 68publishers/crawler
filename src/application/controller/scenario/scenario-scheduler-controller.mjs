import { validationResult } from 'express-validator';
import { paginatedResultMiddleware } from '../middleware/paginated-result-middleware.mjs';
import etag from 'etag';

export class ScenarioSchedulerController {
    #scenarioSchedulerRepository;
    #scenarioSchedulerValidator;
    #schedulerQueue;
    #applicationUrl;

    constructor({ scenarioSchedulerRepository, scenarioSchedulerValidator, schedulerQueue, applicationUrl }) {
        this.#scenarioSchedulerRepository = scenarioSchedulerRepository;
        this.#scenarioSchedulerValidator = scenarioSchedulerValidator;
        this.#schedulerQueue = schedulerQueue;
        this.#applicationUrl = applicationUrl;
    }

    createScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.createScenarioSchedulerValidator(),
            async (req, res, next) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        message: 'The request data is not valid',
                        errors: errors.array(),
                    });
                }

                const userId = req.user.id;
                const { name, flags, config, expression } = req.body;

                try {
                    const scenarioSchedulerId = await this.#scenarioSchedulerRepository.create(userId, name, flags || {}, expression, config);

                    await this.#schedulerQueue.addRefreshJob();

                    const scenarioScheduler = await this.#scenarioSchedulerRepository.get(scenarioSchedulerId);

                    res.status(201)
                        .header('ETag', etag(JSON.stringify(scenarioScheduler), {
                            weak: false,
                        }))
                        .header('Location', `${req.originalUrl}/${scenarioSchedulerId}`)
                        .json(scenarioScheduler);
                } catch (err) {
                    next(err);
                }
            },
        ];
    }

    updateScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.updateScenarioSchedulerValidator(),
            async (req, res, next) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        message: 'The request data is not valid',
                        errors: errors.array(),
                    });
                }

                try {
                    const scenarioSchedulerId = req.params.scenarioSchedulerId;
                    const userId = req.user.id;
                    const { name, flags, config, expression } = req.body;
                    let scenarioScheduler = await this.#scenarioSchedulerRepository.get(scenarioSchedulerId);

                    if (null !== scenarioScheduler) {
                        const ifMatch = req.header('if-match');

                        if (!ifMatch) {
                            return res.status(428).json({
                                message: 'Precondition required, please specify the "If-Match" header',
                            });
                        }

                        const entityTag = etag(JSON.stringify(scenarioScheduler), {
                            weak: false,
                        });

                        if (entityTag !== ifMatch) {
                            return res.status(412).json({
                                message: 'Precondition failed',
                            });
                        }

                        await this.#scenarioSchedulerRepository.update(scenarioSchedulerId, userId, name, flags || {}, expression, config);

                        res.status(200);
                    } else {
                        await this.#scenarioSchedulerRepository.create(userId, name, flags || {}, expression, config, scenarioSchedulerId);

                        res.status(201)
                            .header('Location', `${req.originalUrl}/${scenarioSchedulerId}`);
                    }

                    await this.#schedulerQueue.addRefreshJob();

                    scenarioScheduler = await this.#scenarioSchedulerRepository.get(scenarioSchedulerId);

                    res.header('ETag', etag(JSON.stringify(scenarioScheduler), {
                        weak: false,
                    })).json(scenarioScheduler);
                } catch (err) {
                    next(err);
                }
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
                    message: errors.isEmpty() ? 'OK' : 'The request data is not valid',
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
                this.#applicationUrl,
            ),
        ];
    }

    deleteScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.deleteScenarioSchedulerValidator(),
            async (req, res, next) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        message: 'The request data is not valid',
                        errors: errors.array(),
                    });
                }

                try {
                    if (!(await this.#scenarioSchedulerRepository.delete(req.params.scenarioSchedulerId))) {
                        res.status(404).json({
                            message: 'Scenario scheduler not found',
                        });

                        return;
                    }

                    await this.#schedulerQueue.addRefreshJob();

                    res.status(204).end();
                } catch (err) {
                    next(err);
                }
            },
        ];
    }

    getScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.getScenarioSchedulerValidator(),
            async (req, res, next) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        message: 'The request data is not valid',
                        errors: errors.array(),
                    });
                }

                let scenarioScheduler;

                try {
                    scenarioScheduler = await this.#scenarioSchedulerRepository.get(req.params.scenarioSchedulerId);
                } catch (err) {
                    return next(err);
                }

                if (null === scenarioScheduler) {
                    res.status(404).json({
                        message: 'Scenario scheduler not found',
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
