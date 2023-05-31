import { schedule as scheduleTask } from 'node-cron';
import { v4 as uuid } from 'uuid';

export class Scheduler {
    #scenarioRepository;
    #scenarioSchedulerRepository;
    #scenarioQueue;
    #logger;
    #running;
    #tasks = {};

    constructor({ scenarioRepository, scenarioSchedulerRepository, scenarioQueue, logger }) {
        this.#scenarioRepository = scenarioRepository;
        this.#scenarioSchedulerRepository = scenarioSchedulerRepository;
        this.#scenarioQueue = scenarioQueue;
        this.#logger = logger;
        this.#running = false;
        this.#tasks = [];
    }

    async run() {
        if (this.#running) {
            return;
        }

        const schedulers = await this.#scenarioSchedulerRepository.list({
            filter: {},
            limit: null,
            offset: null,
        }, true);

        for (let scheduler of schedulers) {
            await this.#schedule(scheduler);
        }

        this.#running = true;
    }

    async refresh() {
        if (!this.#running) {
            return;
        }

        const schedulers = await this.#scenarioSchedulerRepository.list({
            filter: {},
            limit: null,
            offset: null,
        }, true);
        const keep = [];

        for (let scheduler of schedulers) {
            const task = this.#tasks[scheduler.id];

            if (!task) {
                await this.#schedule(scheduler);
            } else if ((new Date(task.scheduler.updatedAt)) < (new Date(scheduler.updatedAt))) {
                await this.#destroy(scheduler.id);
                await this.#schedule(scheduler);
            }

            keep.push(scheduler.id);
        }

        for (let schedulerId in this.#tasks) {
            if (!keep.includes(schedulerId)) {
                await this.#destroy(schedulerId);
            }
        }
    }

    async close() {
        for (let schedulerId in this.#tasks) {
            await this.#destroy(schedulerId);
        }

        this.#tasks = {};
        this.#running = false;
    }

    async #destroy(schedulerId) {
        const expression = this.#tasks[schedulerId].scheduler.expression;
        this.#tasks[schedulerId].task.stop();
        delete this.#tasks[schedulerId];

        await this.#logger.info(`Scenario scheduler ${schedulerId} (${expression}) destroyed.`);
    }

    async #schedule(scheduler) {
        this.#tasks[scheduler.id] = {
            scheduler: scheduler,
            task: scheduleTask(scheduler.expression, async () => {
                const scenarioId = uuid();

                await this.#scenarioRepository.create(scenarioId, scheduler.userId, scheduler.name, scheduler.flags, scheduler.config);
                await this.#scenarioQueue.addRunScenarioJob(scenarioId);
            }),
        };

        await this.#logger.info(`Scenario scheduler ${scheduler.id} (${scheduler.expression}) started.`);
    }
}
