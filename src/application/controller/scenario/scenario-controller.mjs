import { v4 as uuid } from 'uuid';
import { validationResult } from 'express-validator';
import { paginatedResultMiddleware } from '../middleware/paginated-result-middleware.mjs';

export class ScenarioController {
    #scenarioRepository;
    #scenarioValidator;
    #scenarioQueue;
    #applicationUrl;

    constructor({ scenarioRepository, scenarioValidator, scenarioQueue, applicationUrl }) {
        this.#scenarioRepository = scenarioRepository;
        this.#scenarioValidator = scenarioValidator;
        this.#scenarioQueue = scenarioQueue;
        this.#applicationUrl = applicationUrl;
    }

    runScenario() {
        return [
            ...this.#scenarioValidator.postScenarioValidator(),
            async (req, res, next) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        message: 'The request data is not valid',
                        errors: errors.array(),
                    });
                }

                const scenarioId = uuid();
                const userId = req.user.id;
                const { name, flags, config } = req.body;

                try {
                    await this.#scenarioRepository.create(scenarioId, userId, name, flags || {}, config);
                    await this.#scenarioQueue.addRunScenarioJob(scenarioId);

                    res.status(202)
                        .header('Location', `${req.originalUrl}/${scenarioId}`)
                        .json(await this.#scenarioRepository.get(scenarioId, false));
                } catch (err) {
                    next(err);
                }
            },
        ];
    }

    validateScenario() {
        return [
            ...this.#scenarioValidator.postScenarioValidator(),
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

    listScenarios() {
        return [
            ...this.#scenarioValidator.listScenariosValidator(),
            paginatedResultMiddleware(
                this.#scenarioRepository.count.bind(this.#scenarioRepository),
                this.#scenarioRepository.list.bind(this.#scenarioRepository),
                this.#applicationUrl,
            ),
        ];
    }

    getScenario() {
        return [
            ...this.#scenarioValidator.getScenarioValidator(),
            async (req, res, next) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        message: 'The request data is not valid',
                        errors: errors.array(),
                    });
                }

                let scenario = null;

                try {
                    scenario = await this.#scenarioRepository.get(req.params.scenarioId);
                } catch (err) {
                    return next(err);
                }

                if (null === scenario) {
                    res.status(404).json({
                        message: 'Scenario not found',
                    });

                    return;
                }

                res.status(200).json(scenario);
            },
        ];
    }

    abortScenario() {
        return [
            ...this.#scenarioValidator.abortScenarioValidator(),
            async (req, res, next) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        message: 'The request data is not valid',
                        errors: errors.array(),
                    });
                }

                const scenarioId = req.params.scenarioId;
                let status = null;

                try {
                    status = await this.#scenarioRepository.getStatus(scenarioId);
                } catch (err) {
                    return next(err);
                }

                if (null === status) {
                    return res.status(404).json({
                        message: 'Scenario not found',
                    });
                }

                if (!(['waiting', 'running'].includes(status))) {
                    return res.status(400).json({
                        message: `Unable to abort the scenario with status "${status}"`,
                    });
                }

                try {
                    await this.#scenarioRepository.markAsAborted(scenarioId);

                    res.status(204).end();
                } catch (err) {
                    next(err);
                }
            },
        ];
    }
}
