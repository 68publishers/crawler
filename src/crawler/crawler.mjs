import {PuppeteerCrawler, Configuration } from 'crawlee';
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
     *         maxRequests?: number,
     *         viewport?: {
     *             width?: number,
     *             height?: number,
     *         },
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
            await this.#doCrawl(scenarioId, config, logger, updateProgressHandler, userDataDir);
        } catch (err) {
            err.message = `Scenario ${scenarioId} failed, reason: ${err.message}`;

            await logger.error(err);
            await this.#scenarioRepository.markAsFailed(scenarioId, err.toString());

            return await this.#scenarioRepository.get(scenarioId);
        } finally {
            this.#cleanup(userDataDir, scenarioId);
        }

        const result = await this.#scenarioRepository.get(scenarioId);
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

            result.status = 'completed';
        } else {
            const errorMessage = 'No url has been successfully crawled.';
            await this.#scenarioRepository.markAsFailed(scenarioId, errorMessage);
            await logger.error(new Error(`Scenario ${scenarioId} failed, reason: ${errorMessage}`));

            result.status = 'failed';
            result.error = errorMessage;
        }

        return result;
    }

    async #doCrawl(scenarioId, config, logger, updateProgressHandler, userDataDir) {
        const scenarioOptions = config.options || {};
        const scenarioViewport = scenarioOptions.viewport || {};
        const maxRequests = 'maxRequests' in scenarioOptions ? scenarioOptions.maxRequests : undefined;
        let viewportOptions = null;

        if ('width' in scenarioViewport && 'height' in scenarioViewport) {
            viewportOptions = {
                width: scenarioViewport.width,
                height: scenarioViewport.height,
            };
        }

        const crawlerOptions = {
            maxRequestRetries: scenarioOptions.maxRequestRetries || 0,
            persistCookiesPerSession: true,
            useSessionPool: true,
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
                    const { page } = crawlingContext;
                    gotoOptions.waitUntil = 'networkidle0';

                    if (viewportOptions) {
                        await page.setViewport(viewportOptions);
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
            async requestHandler({ request, response, page, enqueueLinks, enqueueLinksByClickingElements, crawler }) {
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

                for (let action of config.scenes[scene] || []) {
                    await actionRegistry.get(action.action).execute(
                        action.options,
                        new ExecutionContext({
                            request,
                            page,
                            scenarioId,
                            enqueueLinks,
                            enqueueLinksByClickingElements,
                            saveResult,
                            logger,
                        }),
                    );
                    const afterActionUrl = await page.evaluate(() => location.href);

                    if (afterActionUrl !== request.userData.currentUrl) {
                        request.userData.previousUrl = request.userData.currentUrl;
                        request.userData.currentUrl = afterActionUrl;

                        await saveVisitedUrl(request.userData.previousUrl, request.userData.currentUrl, statusCode, null);
                    }
                }

                await updateProgress(crawler);
            },

            async failedRequestHandler({ request, response, crawler }, err) {
                const scene = request.userData.scene || '?';
                const previousUrl = request.userData.previousUrl;
                const currentUrl = request.url;

                await logger.warning(`Failed to crawl URL ${currentUrl} (scene "${scene}"). ${err.toString()}`);
                await saveVisitedUrl(previousUrl, currentUrl, response ? response.status() : 500, err.toString());
                await updateProgress(crawler);
            },
        }, configuration);

        await crawler.run([
            {
                url: config.entrypoint.url,
                userData: {
                    scene: config.entrypoint.scene,
                    previousUrl: null,
                    identity: null,
                },
            },
        ]);
        await updateProgress(crawler);
    }

    #cleanup(userDataDir, scenarioId) {
        for (let storeDir of [
            userDataDir,
            path.resolve(this.#crawleeStorageDir, `key_value_stores/${scenarioId}`),
            path.resolve(this.#crawleeStorageDir, `request_queues/${scenarioId}`),
        ]) {
            if (existsSync(storeDir)) {
                rmSync(storeDir, {
                    recursive: true,
                });
            }
        }
    }
}
