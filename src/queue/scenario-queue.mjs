import { Queue } from 'bullmq';

export const QUEUE_NAME = 'scenario_queue';

export class ScenarioQueue {
    #scenarioRepository;

    constructor({
        scenarioRepository,
        redisHost,
        redisPort,
        redisAuth = undefined,
    }) {
        this.#scenarioRepository = scenarioRepository;
        const options = {
            connection: {
                host: redisHost,
                port: parseInt(redisPort),
            },
        };

        if ('string' === typeof redisAuth) {
            options.connection.password = redisAuth;
        }

        this.queue = new Queue(QUEUE_NAME, options);
    }

    async addRunScenarioJob(scenarioId) {
        await this.queue.add('run_scenario', {
            scenarioId: scenarioId,
        });
    }
}
