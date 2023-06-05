export class Worker {
    #scenarioWorkerFactory;
    #logger;
    #numberOfWorkerProcesses;
    #redisConfig;
    #workers = [];
    #running;

    constructor({
        scenarioWorkerFactory,
        logger,
        numberOfWorkerProcesses,
        redisHost,
        redisPort,
        redisAuth = undefined,
    }) {
        if (1 > numberOfWorkerProcesses) {
            throw new Error('Argument "numberOfWorkerProcesses" must be integer greater than or equal to 1.');
        }

        this.#scenarioWorkerFactory = scenarioWorkerFactory;
        this.#logger = logger;
        this.#numberOfWorkerProcesses = numberOfWorkerProcesses;
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
            const worker = this.#scenarioWorkerFactory.create(options);

            worker.on('error', async (err) => {
                await this.#logger.error(`${err.name}: ${err.message}\nStack: ${JSON.stringify(err.stack)}`);
            });

            worker.on('failed', async ({ job, failedReason }) => {
                await this.#logger.error(`Job ${job ? job.id : 'unknown'} failed. ${failedReason}`);
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
