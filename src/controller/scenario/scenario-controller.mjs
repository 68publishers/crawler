import { v4 as uuid } from 'uuid';
import { validationResult } from "express-validator";

export class ScenarioController {
    #scenarioRepository;
    #scenarioValidator;
    #scenarioQueue;

    constructor({ scenarioRepository, scenarioValidator, scenarioQueue }) {
        this.#scenarioRepository = scenarioRepository;
        this.#scenarioValidator = scenarioValidator;
        this.#scenarioQueue = scenarioQueue;
    }

    scheduleScenario() {
        return [
            ...this.#scenarioValidator.postScenarioValidator(),
            async (req, res) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(422).json({
                        errors: errors.array(),
                    });
                }

                const scenarioId = uuid();

                await this.#scenarioRepository.create(scenarioId, req.body);
                await this.#scenarioQueue.addRunScenarioJob(scenarioId, req.body);

                res.status(202).json({
                    status: 'running',
                    scenarioId: scenarioId,
                });
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
                    errors: errors.array(),
                });
            },
        ];
    }

    getScenario() {
        return [
            ...this.#scenarioValidator.getScenarioValidator(),
            async (req, res) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        errors: errors.array(),
                    });
                }

                const scenario = await this.#scenarioRepository.get(req.params.scenarioId);

                if (null === scenario) {
                    res.status(404).json({
                        error: 'Scenario not found.',
                    });

                    return;
                }

                res.status(200).json(scenario);
            },
        ];
    }
}
