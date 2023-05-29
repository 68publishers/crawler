import path from 'path';
import { fileURLToPath } from 'url';
import { Worker as BullWorker } from 'bullmq';
import { QUEUE_NAME as SCENARIO_QUEUE_NAME } from '../queue/scenario-queue.mjs';

export class Worker {
    #logger;
    #numberOfWorkerProcesses;
    #redisConfig;
    #workers = [];
    #running;

    constructor({
        logger,
        numberOfWorkerProcesses,
        redisHost,
        redisPort,
        redisAuth = undefined
    }) {
        if (1 > numberOfWorkerProcesses) {
            throw new Error('Argument "numberOfWorkerProcesses" must be integer greater than or equal to 1.');
        }

        this.#logger = logger;
        this.#numberOfWorkerProcesses = numberOfWorkerProcesses;
        this.#redisConfig = {
            host: redisHost,
            port: parseInt(redisPort)
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
                count: 300,
            },
            removeOnFail: {
                count: 1000,
            },
        };

        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const scenarioQueueProcessorPath = path.join(__dirname, 'processor', 'scenario-queue-processor.cjs');

        for (let i = 0; i < this.#numberOfWorkerProcesses; i++) {
            const worker = new BullWorker(
                SCENARIO_QUEUE_NAME,
                scenarioQueueProcessorPath,
                options,
            );

            worker.on("error", async (err) => {
                await this.#logger.error(`${err.name}: ${err.message}\nStack: ${JSON.stringify(err.stack)}`);
            });

            this.#workers.push();
        }

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
