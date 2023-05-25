import {PuppeteerCrawler, Configuration, purgeDefaultStorages } from 'crawlee';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteerExtra.use(StealthPlugin());

export class Crawler {
    #actionRegistry;
    #chromePath;
    #scenarioRepository;

    constructor({ actionRegistry, chromePath, scenarioRepository }) {
        this.#actionRegistry = actionRegistry;
        this.#chromePath = chromePath;
        this.#scenarioRepository = scenarioRepository;
    }

    async crawl(scenarioId, scenario, logger, updateProgressHandler = undefined) {
        await logger.info(`Running scenario ${scenarioId}`);

        try {
            await this.#doCrawl(scenarioId, scenario, logger, updateProgressHandler);
            await this.#scenarioRepository.complete(scenarioId);
            await logger.info(`Scenario ${scenarioId} completed`);
        } catch (err) {
            await logger.error(`Scenario ${scenarioId} failed, reason: ${err.message}`);
            await this.#scenarioRepository.fail(scenarioId);

            throw err;
        }

        return await this.#scenarioRepository.get(scenarioId);
    }

    async #doCrawl(scenarioId, scenario, logger, updateProgressHandler) {
        const scenarioOptions = scenario.options || {};
        const scenarioViewport = scenarioOptions.viewport || {};
        const requests = [scenario.url];
        const maxRequests = 'maxRequests' in scenarioOptions ? scenarioOptions.maxRequests : undefined;
        let viewportOptions = null;
        let startupCookies = null;

        if ('width' in scenarioViewport && 'height' in scenarioViewport) {
            viewportOptions = {
                width: scenarioViewport.width,
                height: scenarioViewport.height,
            };
        }

        const crawlerOptions = {
            maxRequestRetries: 0,
            launchContext: {
                launcher: puppeteerExtra,
                launchOptions: {
                    headless: true,
                    ignoreHTTPSErrors: true,
                    executablePath: this.#chromePath,
                    args: [
                        '--disable-web-security'
                    ],
                },
            },
            preNavigationHooks: [
                async (crawlingContext, gotoOptions) => {
                    const { page } = crawlingContext;
                    gotoOptions.waitUntil = 'networkidle0';

                    if (viewportOptions) {
                        page.setViewport(viewportOptions);
                    }

                    if (startupCookies) {
                        page.setCookie.apply(page, startupCookies);
                    }
                },
            ],
        };

        if (maxRequests) {
            crawlerOptions.maxRequestsPerCrawl = maxRequests;
        }

        const saveResult = async (group, identity, data, mergeOnConflict = true) => {
            await this.#scenarioRepository.addResult(scenarioId, group, identity, data, mergeOnConflict);
        };

        const executeActions = async (actions, page, enqueueLinks, isStartup) => {
            for (let action of actions) {
                const actionHandler = this.#actionRegistry.get(action.action);

                if (isStartup && 'enqueueLinks' === actionHandler.name) {
                    startupCookies = await page.cookies();
                }

                await actionHandler.execute(action.options, { page, enqueueLinks, saveResult, scenarioId, logger })
            }
        }

        const updateProgress = async (crawler) => {
            if (undefined === updateProgressHandler) {
                return;
            }

            const info = await crawler.requestQueue.getInfo();
            let total = info.handledRequestCount + info.pendingRequestCount;

            if (total > maxRequests) {
                total = maxRequests;
            }

            const progress = 0 < total ? parseFloat(
                (info.handledRequestCount / total * 100).toFixed(1)
            ) : 0;

            updateProgressHandler(progress > 100 ? 100 : progress);
        }

        const configuration = Configuration.getGlobalConfig();

        configuration.set('defaultKeyValueStoreId', scenarioId);
        configuration.set('defaultRequestQueueId', scenarioId);
        configuration.set('persistStorage', false);

        const crawler = new PuppeteerCrawler({
            ...crawlerOptions,
            async requestHandler({ request, response, page, enqueueLinks, crawler }) {
                if (response.status() < 200 || response.status() > 399) {
                    await logger.warning(`Failed to crawl URL ${request.url}, status code is ${response.status()}`);
                    await saveResult('visitedUrls', request.url, request.url, false);

                    return;
                }

                await logger.info(`Starting to crawl URL ${page.url()}`);
                await saveResult('visitedUrls', page.url(), page.url(), false);

                if ('FOR_EACH' !== request.label) {
                    await executeActions(scenario.startup || [], page, enqueueLinks, true);
                    startupCookies = await page.cookies();
                }

                await executeActions(scenario.forEach || [], page, enqueueLinks, false);
                await updateProgress(crawler);
            },

            async failedRequestHandler({ request, crawler }) {
                await logger.error(`Failed to crawl URL ${request.url}`);
                await saveResult('visitedUrls', request.url, request.url, false);
                await updateProgress(crawler);
            },

            async errorHandler({}, error) {
                await logger.error(error.toString());
            }
        }, configuration);

        await crawler.run(requests);
        await updateProgress(crawler);
    }
}
