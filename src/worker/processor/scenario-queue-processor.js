const dotenv = require('dotenv').config;

dotenv();

module.exports = async (job) => {
    const container = (await import('../../bootstrap.mjs')).Bootstrap.boot();
    const LoggerChain = (await import('../../logger/logger-chain.mjs')).LoggerChain;
    const JobLogger = (await import('../../logger/job-logger.mjs')).JobLogger;
    const loggerService = container.resolve('logger');

    const logger = new LoggerChain({
        loggers: [
            new JobLogger({
                job: job,
            }),
            loggerService,
        ],
    });

    if ('run_scenario' === job.name) {
        const crawler = container.resolve('crawler');

        const result = await crawler.crawl(job.data.scenarioId, job.data.scenario, logger, (progress) => {
            job.updateProgress(progress);
        });

        if (job.data.scenario.hasOwnProperty('callbackUri') && 'string' === typeof job.data.scenario.callbackUri) {
            const notifier = container.resolve('callbackUriNotifier');

            await notifier.notify(job.data.scenario.callbackUri, result, logger);
        }

        return result;
    }

    throw new Error(`Unable to handle job "${job.name}".`);
}
