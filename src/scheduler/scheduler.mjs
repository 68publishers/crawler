import { schedule as scheduleTask } from 'node-cron';
import { v4 as uuid } from 'uuid';

export class Scheduler {
    #scenarioRepository;
    #scenarioSchedulerRepository;
    #scenarioQueue;
    #running;
    #tasks = {};

    constructor({ scenarioRepository, scenarioSchedulerRepository, scenarioQueue }) {
        this.#scenarioRepository = scenarioRepository;
        this.#scenarioSchedulerRepository = scenarioSchedulerRepository;
        this.#scenarioQueue = scenarioQueue;
        this.#running = false;
        this.#tasks = [];
    }

    async run(logger = undefined) {
        if (this.#running) {
            return;
        }

        const schedulers = await this.#scenarioSchedulerRepository.list({
            filter: {
                active: true,
            },
            limit: null,
            offset: null,
        }, true);

        for (let scheduler of schedulers) {
            await this.#schedule(scheduler, logger);
        }

        this.#running = true;
    }

    async refresh(logger = undefined) {
        if (!this.#running) {
            return {
                message: 'Scheduler not running, nothing to refresh.',
                changes: [],
            };
        }

        const schedulers = await this.#scenarioSchedulerRepository.list({
            filter: {
                active: true,
            },
            limit: null,
            offset: null,
        }, true);
        const keep = [];
        const changes = [];

        for (let scheduler of schedulers) {
            const task = this.#tasks[scheduler.id];

            if (!task) {
                await this.#schedule(scheduler, logger);

                changes.push({
                    scenarioSchedulerId: scheduler.id,
                    expression: scheduler.expression,
                    status: 'started',
                });
            } else if ((new Date(task.scheduler.updatedAt)) < (new Date(scheduler.updatedAt))) {
                await this.#destroy(scheduler.id, logger);
                await this.#schedule(scheduler, logger);

                changes.push({
                    scenarioSchedulerId: scheduler.id,
                    expression: scheduler.expression,
                    status: 'refreshed',
                });
            }

            keep.push(scheduler.id);
        }

        for (let schedulerId in this.#tasks) {
            if (!keep.includes(schedulerId)) {
                const task = this.#tasks[schedulerId];

                await this.#destroy(schedulerId, logger);

                changes.push({
                    scenarioSchedulerId: task.scheduler.id,
                    expression: task.scheduler.expression,
                    status: 'destroyed',
                });
            }
        }

        return {
            message: 'Scheduler refreshed.',
            changes: changes,
        };
    }

    async close(logger = undefined) {
        for (let schedulerId in this.#tasks) {
            await this.#destroy(schedulerId, logger);
        }

        this.#tasks = {};
        this.#running = false;
    }

    async #destroy(schedulerId, logger) {
        const expression = this.#tasks[schedulerId].scheduler.expression;
        this.#tasks[schedulerId].task.stop();
        delete this.#tasks[schedulerId];

        logger && (await logger.info(`Scenario scheduler ${schedulerId} (${expression}) destroyed.`));
    }

    async #schedule(scheduler, logger) {
        this.#tasks[scheduler.id] = {
            scheduler: scheduler,
            task: scheduleTask(scheduler.expression, async () => {
                const currentScheduler = await this.#scenarioSchedulerRepository.get(scheduler.id);

                if (null === currentScheduler || (new Date(scheduler.updatedAt)) < (new Date(currentScheduler.updatedAt))) {
                    await this.refresh();
                }

                if (null === currentScheduler) {
                    return;
                }

                const scenarioId = uuid();

                await this.#scenarioRepository.create(scenarioId, currentScheduler.userId, currentScheduler.name, currentScheduler.flags, currentScheduler.config);
                await this.#scenarioQueue.addRunScenarioJob(scenarioId);
            }),
        };

        logger && (await logger.info(`Scenario scheduler ${scheduler.id} (${scheduler.expression}) started.`));
    }
}
