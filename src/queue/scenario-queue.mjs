import { Queue } from 'bullmq';

export const QUEUE_NAME = 'scenario_queue';

export class ScenarioQueue {
    constructor({
        redisHost,
        redisPort,
        redisAuth = undefined
    }) {
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
    }

    async addRunScenarioJob(userId, scenarioId, scenario) {
        await this.queue.add('run_scenario', {
            userId: userId,
            scenarioId: scenarioId,
            scenario: scenario,
        });
    }
}
