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
        const scenarioRepository = container.resolve('scenarioRepository');
        const crawler = container.resolve('crawler');

        const scenario = await scenarioRepository.get(job.data.scenarioId, false);

        if (null === scenario) {
            const err = new Error(`Unable to process scenario ${job.data.scenarioId}. The scenario not found in the database.`);
            await logger.error(err.toString());

            throw err;
        }

        const config = scenario.config;
        const userId = scenario.userId;
        const callbackUri = config.callbackUri || null;

        const result = await crawler.crawl(job.data.scenarioId, config, logger, (progress) => {
            job.updateProgress(progress);
        });

        if (userId && 'string' === typeof callbackUri) {
            const notifier = container.resolve('callbackUriNotifier');
            const userRepository = container.resolve('userRepository');
            let user = null;

            try {
                user = await userRepository.getById(userId);
            } catch (err) {
                await logger.error('Unable to send callback uri notification, user not found.');

                return result;
            }

            await notifier.notify(callbackUri, result, logger, null !== user ? [
                user.username,
                user.callbackUriToken,
            ] : undefined);
        }

        return result;
    }

    throw new Error(`Unable to handle job "${job.name}".`);
}
