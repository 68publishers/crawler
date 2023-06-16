import { Worker as BullWorker } from 'bullmq';
import { QUEUE_NAME as SCHEDULER_QUEUE_NAME } from '../queue/scheduler-queue.mjs';
import { LoggerChain } from '../logger/logger-chain.mjs';
import { JobLogger } from '../logger/job-logger.mjs';

export class SchedulerWorker {
    #scheduler;
    #logger;
    #redisConfig;
    #workers = [];
    #running;

    constructor({
        scheduler,
        logger,
        redisHost,
        redisPort,
        redisAuth = undefined,
    }) {
        this.#scheduler = scheduler;
        this.#logger = logger;
        this.#redisConfig = {
            host: redisHost,
            port: parseInt(redisPort),
        };

        if ('string' === typeof redisAuth) {
            this.#redisConfig.password = redisAuth;
        }

        this.#workers = [];
        this.#running = false;
    }

    run() {
        if (this.#running) {
            return;
        }

        const options = {
            connection: this.#redisConfig,
            removeOnComplete: {
                count: 100,
            },
            removeOnFail: {
                count: 300,
            },
            maxStalledCount: 0,
        };

        const worker = new BullWorker(
            SCHEDULER_QUEUE_NAME,
            async (job) => {
                const logger = new LoggerChain({
                    loggers: [
                        new JobLogger({
                            job: job,
                        }),
                        this.#logger,
                    ],
                });

                if ('refresh' === job.name) {
                    return await this.#scheduler.refresh(logger);
                }

                throw new Error(`Unable to handle job "${job.name}".`);
            },
            options,
        );

        worker.on('error', async (err) => {
            await this.#logger.error(err);
        });

        worker.on('failed', async ({ job, failedReason }) => {
            await this.#logger.error(`Job ${job ? job.id : 'unknown'} failed. ${failedReason}`);
        });

        this.#workers.push(worker);
        this.#running = true;
    }

    async close() {
        for (let worker of this.#workers) {
            await worker.close();
        }

        this.#running = false;
        this.#workers = [];
    }
}
