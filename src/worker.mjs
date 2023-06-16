import { Bootstrap } from './bootstrap.mjs';

const container = Bootstrap.boot();

const logger = container.resolve('logger');
const scenarioWorker = container.resolve('scenarioWorker');

process.on('uncaughtException', async (err) => {
    err.message = '[worker] ' +  err.message;
    await logger.error(err);
    process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
    await logger.error(`[worker] Unhandled Rejection at: Promise. ${reason}`);
    process.exit(1);
});

process.on('SIGTERM', async () => {
    console.log('[worker] SIGTERM signal received: closing the workers.');
    await scenarioWorker.close();
});

scenarioWorker.run();
console.log(`Worker started.`);
