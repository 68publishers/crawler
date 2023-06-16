import { Queue } from 'bullmq';

export const QUEUE_NAME = 'scheduler_queue';

export class SchedulerQueue {
    constructor({
        redisHost,
        redisPort,
        redisAuth = undefined,
    }) {
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

    async addRefreshJob() {
        await this.queue.add('refresh', {});
    }
}
