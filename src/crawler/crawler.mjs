import {PuppeteerCrawler, Configuration } from 'crawlee';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ExecutionContext } from '../action/execution-context.mjs';
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
    #varDir;

    constructor({ actionRegistry, chromePath, scenarioRepository, varDir }) {
        this.#actionRegistry = actionRegistry;
        this.#chromePath = chromePath;
        this.#scenarioRepository = scenarioRepository;
        this.#varDir = varDir;
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
     * @returns {Promise<*>}
     */
    async crawl(scenarioId, config, logger, updateProgressHandler = undefined) {
        await logger.info(`Running scenario ${scenarioId}`);

        try {
            await this.#doCrawl(scenarioId, config, logger, updateProgressHandler);
            await this.#scenarioRepository.complete(scenarioId);
            await logger.info(`Scenario ${scenarioId} completed`);
        } catch (err) {
            await logger.error(`Scenario ${scenarioId} failed, reason: ${err.message}`);
            await this.#scenarioRepository.fail(scenarioId, err.toString());

            throw err;
        }

        return await this.#scenarioRepository.get(scenarioId);
    }

    async #doCrawl(scenarioId, config, logger, updateProgressHandler) {
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
            launchContext: {
                launcher: puppeteerExtra,
                launchOptions: {
                    headless: true,
                    ignoreHTTPSErrors: true,
                    executablePath: this.#chromePath,
                    args: [
                        '--disable-web-security',
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                    ],
                },
            },
            preNavigationHooks: [
                async (crawlingContext, gotoOptions) => {
                    const { page, request } = crawlingContext;
                    gotoOptions.waitUntil = 'networkidle0';

                    if (viewportOptions) {
                        page.setViewport(viewportOptions);
                    }

                    if (request.userData.previousCookies) {
                        page.setCookie.apply(page, request.userData.previousCookies);
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
                'visitedUrls',
                sha256(`${previousUrl || 'null'}=>${currentUrl}`),
                {
                    url: currentUrl,
                    statusCode: statusCode,
                    error: error,
                    foundOnUrl: previousUrl,
                },
                false,
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

        configuration.set('defaultKeyValueStoreId', scenarioId);
        configuration.set('defaultRequestQueueId', scenarioId);

        const crawler = new PuppeteerCrawler({
            ...crawlerOptions,
            async requestHandler({ request, response, page, enqueueLinks, crawler }) {
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

            async failedRequestHandler({ request, response, crawler }) {
                const scene = request.userData.scene || '?';
                const previousUrl = request.userData.currentUrl;
                const currentUrl = request.url;

                await logger.error(`Failed to crawl URL ${currentUrl} (scene "${scene}")`);
                await saveVisitedUrl(previousUrl, currentUrl, response ? response.status() : 500, response ? response.statusText() : 'unknown');
                await updateProgress(crawler);
            },
        }, configuration);

        await crawler.run([
            {
                url: config.entrypoint.url,
                userData: {
                    scene: config.entrypoint.scene,
                    previousCookies: null,
                    previousUrl: null,
                    identity: null,
                },
            },
        ]);
        await updateProgress(crawler);

        // cleanup
        for (let storeDir of [
            path.resolve(this.#varDir, `crawlee/key_value_stores/${scenarioId}`),
            path.resolve(this.#varDir, `crawlee/request_queues/${scenarioId}`),
        ]) {
            if (existsSync(storeDir)) {
                rmSync(storeDir, {
                    recursive: true,
                });
            }
        }
    }
}
