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
            const userRepository = container.resolve('userRepository');
            let user = null;

            try {
                user = await userRepository.getById(job.data.userId);
            } catch (err) {
                await logger.error('Unable to send callback uri notification, user not found.');

                return result;
            }

            await notifier.notify(job.data.scenario.callbackUri, result, logger, null !== user ? [
                user.username,
                user.callback_uri_token,
            ] : undefined);
        }

        return result;
    }

    throw new Error(`Unable to handle job "${job.name}".`);
}
