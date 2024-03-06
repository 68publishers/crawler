import { Worker as BullWorker } from 'bullmq';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import { QUEUE_NAME as SCENARIO_QUEUE_NAME } from '../queue/scenario-queue.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scenarioQueueProcessorPath = path.join(__dirname, 'processor', 'scenario-queue-processor.cjs');

export class ScenarioWorker {
    #scenarioRepository;
    #logger;
    #numberOfWorkerProcesses;
    #redisConfig;
    #workers = [];
    #running;

    constructor({
        scenarioRepository,
        logger,
        numberOfWorkerProcesses,
        redisHost,
        redisPort,
        redisAuth = undefined,
        redisDb = 0,
    }) {
        if (1 > numberOfWorkerProcesses) {
            throw new Error('Argument "numberOfWorkerProcesses" must be integer greater than or equal to 1.');
        }

        this.#scenarioRepository = scenarioRepository;
        this.#logger = logger;
        this.#numberOfWorkerProcesses = numberOfWorkerProcesses;
        this.#redisConfig = {
            host: redisHost,
            port: redisPort,
            db: redisDb,
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
            useWorkerThreads: true,
            lockDuration: 120000,
            maxStalledCount: 0,
        };

        for (let i = 0; i < this.#numberOfWorkerProcesses; i++) {
            const worker = new BullWorker(
                SCENARIO_QUEUE_NAME,
                scenarioQueueProcessorPath,
                options,
            );

            worker.on('error', async (err) => {
                await this.#logger.error(err);
            });

            worker.on('failed', async ({ job, failedReason }) => {
                await this.#logger.error(`Job ${job ? job.id : 'unknown'} failed. ${failedReason}`);

                if (job && job.data.scenarioId) {
                    await this.#scenarioRepository.markAsFailed(job.data.scenarioId, failedReason);
                }
            });

            this.#workers.push(worker);
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
