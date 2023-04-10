import {v4 as uuid} from 'uuid';

export class ScenarioController {
    #crawler;
    #scenarioRepository;

    constructor({ crawler, scenarioRepository }) {
        this.#crawler = crawler;
        this.#scenarioRepository = scenarioRepository;
    }

    scheduleScenario(req, res) {
        const scenarioId = uuid();

        // noinspection JSIgnoredPromiseFromCall
        this.#crawler.crawl(scenarioId, req.body);

        res.status(202).json({
            status: 'running',
            scenarioId: scenarioId,
        });
    }

    async getScenario(req, res) {
        const scenario = await this.#scenarioRepository.get(req.params.scenarioId);

        if (null === scenario) {
            res.status(404).json({
                error: 'Scenario not found.',
            });

            return;
        }

        res.status(200).json(scenario);
    }
}
