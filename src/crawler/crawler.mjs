import { Configuration, ProxyConfiguration } from 'crawlee';
import { PuppeteerCrawler } from './puppeteer-crawler.mjs';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ExecutionContext } from '../action/execution-context.mjs';
import { ScenarioResultGroups } from '../model/scenario/scenario-result-groups.mjs';
import { sha256 } from '../helper/hash.mjs';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

puppeteerExtra.use(StealthPlugin());

/**
 * @callback updateProgressHandlerCallback
 * @param {number} progress
 */
export class Crawler {
    #actionRegistry;
    #chromePath;
    #scenarioRepository;
    #crawleeStorageDir;

    constructor({ actionRegistry, chromePath, scenarioRepository, crawleeStorageDir }) {
        this.#actionRegistry = actionRegistry;
        this.#chromePath = chromePath;
        this.#scenarioRepository = scenarioRepository;
        this.#crawleeStorageDir = crawleeStorageDir;
    }

    /**
     * @param {string} scenarioId
     * @param {{
     *     entrypoint: {
     *         url: string,
     *         scene: string,
     *     },
     *     callbackUri?: string,
     *     options?: {
     *         maxConcurrency?: number,
     *         maxRequests?: number,
     *         maxRequestRetries?: number,
     *         viewport?: {
     *             width?: number,
     *             height?: number,
     *         },
     *         session:? {
     *             maxPoolSize?: number,
     *             maxSessionUsageCount?: number,
     *             transferredCookies?: array<string>,
     *         },
     *         waitUntil?: string,
     *         proxyUrls?: array<string>,
     *     },
     *     scenes: Object.<string, array<{
     *         action: string,
     *         options: object,
     *     }>>,
     * }} config
     * @param {object} logger
     * @param {updateProgressHandlerCallback} updateProgressHandler
     *
     * @returns {object}
     */
    async crawl(scenarioId, config, logger, updateProgressHandler = undefined) {
        const userDataDir = `/tmp/puppeteer_dev_profile_${scenarioId}`;

        try {
            await logger.info(`Running scenario ${scenarioId}`);
            await this.#scenarioRepository.markAsRunning(scenarioId);

            const aborted = 'ABORTED' === await this.#doCrawl(scenarioId, config, logger, updateProgressHandler, userDataDir);

            if (aborted) {
                await logger.info(`Scenario ${scenarioId} aborted.`);

                return await this.#scenarioRepository.get(scenarioId);
            }
        } catch (err) {
            err.message = `Scenario ${scenarioId} failed, reason: ${err.message}`;

            await logger.error(err);
            await this.#scenarioRepository.markAsFailed(scenarioId, err.toString());

            return await this.#scenarioRepository.get(scenarioId);
        } finally {
            this.#cleanup(userDataDir, scenarioId);
        }

        let result = await this.#scenarioRepository.get(scenarioId);
        let isAnyUrlSuccessfullyVisited = false;

        for (let visitedUrl of result.results.visitedUrls) {
            if (null === visitedUrl.error && 300 > visitedUrl.statusCode) {
                isAnyUrlSuccessfullyVisited = true;

                break;
            }
        }

        if (isAnyUrlSuccessfullyVisited) {
            await this.#scenarioRepository.markAdCompleted(scenarioId);
            await logger.info(`Scenario ${scenarioId} completed`);
        } else {
            const errorMessage = 'No url has been successfully crawled.';
            await this.#scenarioRepository.markAsFailed(scenarioId, errorMessage);
            await logger.error(new Error(`Scenario ${scenarioId} failed, reason: ${errorMessage}`));
        }

        return await this.#scenarioRepository.get(scenarioId);
    }

    async #doCrawl(scenarioId, config, logger, updateProgressHandler, userDataDir) {
        const scenarioOptions = config.options || {};
        const scenarioViewport = scenarioOptions.viewport || {};
        const scenarioSessionOptions = scenarioOptions.session || {};
        const maxRequests = 'maxRequests' in scenarioOptions ? scenarioOptions.maxRequests : undefined;
        let viewportOptions = null;
        let aborted = false;

        if ('width' in scenarioViewport && 'height' in scenarioViewport) {
            viewportOptions = {
                width: scenarioViewport.width,
                height: scenarioViewport.height,
            };
        }

        const checkAbortion = async (crawler) => {
            if (aborted) {
                return true;
            }

            if ('aborted' === (await this.#scenarioRepository.getStatus(scenarioId))) {
                aborted = true;
                await logger.info(`Scenario ${scenarioId} receives an abort signal.`);
                await crawler.autoscaledPool.abort();

                return true;
            }

            return false;
        };

        const crawlerOptions = {
            maxRequestRetries: scenarioOptions.maxRequestRetries || 0,
            persistCookiesPerSession: true,
            useSessionPool: true,
            sessionPoolOptions: {
                sessionOptions: {},
            },
            launchContext: {
                launcher: puppeteerExtra,
                launchOptions: {
                    headless: true,
                    ignoreHTTPSErrors: true,
                    executablePath: this.#chromePath,
                    args: [
                        '--disable-web-security',
                    ],
                    userDataDir: userDataDir,
                },
            },
            preNavigationHooks: [
                async (crawlingContext, gotoOptions) => {
                    const { page, request } = crawlingContext;

                    if (aborted) {
                        request.skipNavigation = true;

                        return;
                    }

                    gotoOptions.waitUntil = scenarioOptions.waitUntil || 'networkidle0';

                    if (viewportOptions) {
                        await page.setViewport(viewportOptions);
                    }
                },
            ],
        };

        if (maxRequests) {
            crawlerOptions.maxRequestsPerCrawl = maxRequests;
        }

        if ('maxConcurrency' in scenarioOptions) {
            crawlerOptions.maxConcurrency = scenarioOptions.maxConcurrency;
        }

        if ('maxPoolSize' in scenarioSessionOptions) {
            crawlerOptions.sessionPoolOptions.maxPoolSize = scenarioSessionOptions.maxPoolSize;
        }

        if ('maxSessionUsageCount' in scenarioSessionOptions) {
            crawlerOptions.sessionPoolOptions.sessionOptions.maxUsageCount = scenarioSessionOptions.maxSessionUsageCount;
        }

        if ('proxyUrls' in scenarioOptions && Array.isArray(scenarioOptions.proxyUrls)) {
            crawlerOptions.proxyConfiguration = new ProxyConfiguration({
                proxyUrls: scenarioOptions.proxyUrls,
            });
        }

        const saveResult = async (group, identity, data, mergeOnConflict = true) => {
            await this.#scenarioRepository.addResult(scenarioId, group, identity, data, mergeOnConflict);
        };

        const saveVisitedUrl = async (previousUrl, currentUrl, statusCode, error) => {
            await saveResult(
                ScenarioResultGroups.VISITED_URLS,
                sha256(`${previousUrl || 'null'}=>${currentUrl}`),
                {
                    url: currentUrl,
                    statusCode: statusCode,
                    error: error,
                    foundOnUrl: previousUrl,
                },
                true,
            );
        };

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
                (info.handledRequestCount / total * 100).toFixed(1),
            ) : 0;

            updateProgressHandler(progress > 100 ? 100 : progress);
        }

        const actionRegistry = this.#actionRegistry;
        const configuration = Configuration.getGlobalConfig();

        configuration.set('purgeOnStart', false);
        configuration.set('defaultKeyValueStoreId', scenarioId);
        configuration.set('defaultRequestQueueId', scenarioId);

        const crawler = new PuppeteerCrawler({
            ...crawlerOptions,
            async requestHandler({ request, response, page, enqueueLinks, enqueueLinksByClickingElements, crawler, browserController }) {
                if ((await checkAbortion(crawler))) {
                    return;
                }

                const statusCode = response.status();
                const scene = request.userData.scene;
                let previousUrl = request.userData.previousUrl;

                if (statusCode < 200 || statusCode > 399) {
                    await logger.warning(`Failed to crawl URL ${request.url} (scene "${scene}"), status code is ${statusCode}`);
                    await saveVisitedUrl(previousUrl, request.url, statusCode, response.statusText());

                    return;
                }

                request.userData.currentUrl = page.url();

                await logger.info(`Starting to crawl URL ${request.userData.currentUrl} (scene "${scene}")`);
                await saveVisitedUrl(previousUrl, request.userData.currentUrl, statusCode, null);

                const executionContext = new ExecutionContext({
                    request,
                    page,
                    scenarioId,
                    scenarioOptions,
                    enqueueLinks,
                    enqueueLinksByClickingElements,
                    saveResult,
                    logger,
                    browserController,
                    actionRegistry,
                    scenes: config.scenes,
                    afterActionExecutionCallback: async ({ request, page }) => {
                        const afterActionUrl = await page.evaluate(() => location.href);

                        if (afterActionUrl !== request.userData.currentUrl) {
                            request.userData.previousUrl = request.userData.currentUrl;
                            request.userData.currentUrl = afterActionUrl;

                            await saveVisitedUrl(request.userData.previousUrl, request.userData.currentUrl, statusCode, null);
                        }
                    },
                })

                await executionContext.runScene(scene);
                await updateProgress(crawler);
            },

            async failedRequestHandler({ request, response, crawler }, err) {
                if ((await checkAbortion(crawler))) {
                    return;
                }

                const scene = request.userData.scene || '?';
                const previousUrl = request.userData.previousUrl;
                const currentUrl = request.url;

                await logger.warning(`Failed to crawl URL ${currentUrl} (scene "${scene}"). ${err.toString()}`);
                await saveVisitedUrl(previousUrl, currentUrl, response ? response.status() : 500, err.toString());
                await updateProgress(crawler);
            },

            async errorHandler({ crawler, request }, err) {
                if ((await checkAbortion(crawler))) {
                    request.noRetry = true;
                }

                const scene = request.userData.scene || '?';
                const currentUrl = request.url;

                await logger.warning(`Failed to crawl URL ${currentUrl} (scene "${scene}"). The request has been reclaimed back to the queue. ${err.toString()}`);
            },
        }, configuration);

        await crawler.run([
            {
                url: config.entrypoint.url,
                userData: {
                    scene: config.entrypoint.scene,
                    previousUrl: null,
                    identity: null,
                    transferredCookies: [],
                },
            },
        ]);
        await updateProgress(crawler);
        await checkAbortion(crawler);

        const waitForRequestQueue = finished => {
            if (finished) {
                return finished;
            }

            return new Promise((resolve) => setTimeout(resolve, 100))
                .then(() => Promise.resolve(0 >= crawler.requestQueue.inProgressCount()))
                .then(res => waitForRequestQueue(res));
        }

        await waitForRequestQueue(false);

        return aborted ? 'ABORTED' : 'OK';
    }

    #cleanup(userDataDir, scenarioId = undefined) {
        const dirs = [
            userDataDir,
        ];

        if (scenarioId) {
            dirs.push(path.resolve(this.#crawleeStorageDir, `key_value_stores/${scenarioId}`));
            dirs.push(path.resolve(this.#crawleeStorageDir, `request_queues/${scenarioId}`));
        }

        for (let storeDir of dirs) {
            if (existsSync(storeDir)) {
                rmSync(storeDir, {
                    recursive: true,
                });
            }
        }
    }
}
