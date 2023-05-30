import { validationResult } from "express-validator";
import { paginatedResultMiddleware } from '../middleware/paginated-result-middleware.mjs';

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
                    return res.status(422).json({
                        errors: errors.array(),
                    });
                }

                const scenario = req.body;
                const { expression } = scenario;
                const userId = req.user.id;

                delete scenario.expression;

                const scenarioSchedulerId = await this.#scenarioSchedulerRepository.create(userId, expression, scenario);

                await this.#scheduler.refresh();

                res.status(201).json({
                    scenarioSchedulerId: scenarioSchedulerId,
                });
            },
        ];
    }

    updateScenarioScheduler() {
        return [
            ...this.#scenarioSchedulerValidator.updateScenarioSchedulerValidator(),
            async (req, res) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(422).json({
                        errors: errors.array(),
                    });
                }

                const scenarioSchedulerId = req.params.scenarioSchedulerId;
                const scenario = req.body;
                const { expression } = scenario;
                const userId = req.user.id;

                delete scenario.expression;

                if ((await this.#scenarioSchedulerRepository.exists(scenarioSchedulerId))) {
                    await this.#scenarioSchedulerRepository.update(scenarioSchedulerId, userId, expression, scenario);
                    await this.#scheduler.refresh();

                    res.status(204).end();
                } else {
                    await this.#scenarioSchedulerRepository.create(userId, expression, scenario, scenarioSchedulerId);
                    await this.#scheduler.refresh();

                    res.status(201).json({
                        scenarioSchedulerId: scenarioSchedulerId,
                    });
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

                res.status(200).json(scenarioScheduler);
            },
        ];
    }
}
