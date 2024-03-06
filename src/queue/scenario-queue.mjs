import { Queue } from 'bullmq';

export const QUEUE_NAME = 'scenario_queue';

export class ScenarioQueue {
    constructor({
        redisHost,
        redisPort,
        redisAuth = undefined,
        redisDb = 0,
    }) {
        const options = {
            connection: {
                host: redisHost,
                port: redisPort,
                db: redisDb,
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
