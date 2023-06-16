import { Bootstrap } from './bootstrap.mjs';

const container = Bootstrap.boot();

const logger = container.resolve('logger');
const scheduler = container.resolve('scheduler');
const schedulerWorker = container.resolve('schedulerWorker');

process.on('uncaughtException', async (err) => {
    err.message = '[scheduler] ' +  err.message;
    await logger.error(err);
    process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
    await logger.error(`[scheduler] Unhandled Rejection at: Promise. ${reason}`);
    process.exit(1);
});

process.on('SIGTERM', async () => {
    console.log('[scheduler] SIGTERM signal received: closing the scheduler and the worker.');
    await scheduler.close();
    await schedulerWorker.close();
});

await scheduler.run(logger);
console.log(`Scheduler started.`);

schedulerWorker.run();
console.log(`Scheduler worker started.`);
