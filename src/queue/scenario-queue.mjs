import { Queue } from 'bullmq';

export const QUEUE_NAME = 'scenario_queue';

export class ScenarioQueue {
    #scenarioRepository;

    constructor({
        scenarioRepository,
        redisHost,
        redisPort,
        redisAuth = undefined
    }) {
        this.#scenarioRepository = scenarioRepository;
        const options = {
            connection: {
                host: redisHost,
                port: parseInt(redisPort)
            }
        };

        if ('string' === typeof redisAuth) {
            options.connection.password = redisAuth;
        }

        this.queue = new Queue(QUEUE_NAME, options);

        this.queue.on('failed', async (job, error) => {
            const scenarioId = job.data.scenarioId;

            if (scenarioId) {
                await this.#scenarioRepository.fail(scenarioId, error.toString());
            }
        });
    }

    async addRunScenarioJob(userId, scenarioId, scenario) {
        await this.queue.add('run_scenario', {
            userId: userId,
            scenarioId: scenarioId,
            scenario: scenario,
        });
    }
}
