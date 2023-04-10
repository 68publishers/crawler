import {PuppeteerCrawler} from 'crawlee';
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

    async crawl(scenarioId, scenario) {
        const scenarioOptions = scenario.options || {};
        const scenarioViewport = scenarioOptions.viewport || {};
        let viewportOptions = {};

        if ('width' in scenarioViewport && 'height' in scenarioViewport) {
            viewportOptions = {
                defaultViewport: {
                    width: scenarioViewport.width,
                    height: scenarioViewport.height,
                },
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
                    ...viewportOptions
                },
            },
            preNavigationHooks: [
                (crawlingContext, gotoOptions) => {
                    gotoOptions.waitUntil = 'networkidle0';
                },
            ]
        };

        if ('maxRequests' in scenarioOptions) {
            crawlerOptions.maxRequestsPerCrawl = scenarioOptions.maxRequests;
        }

        const saveResult = async (group, identity, data, mergeOnConflict = true) => {
            await this.#scenarioRepository.addResult(scenarioId, group, identity, data, mergeOnConflict);
        };

        const executeActions = async (actions, page, saveSnapshot, enqueueLinks) => {
            for (let action of actions) {
                await this.#actionRegistry.get(action.action).execute(action.options, { page, saveSnapshot, enqueueLinks, saveResult })
            }
        }

        const crawler = new PuppeteerCrawler({
            ...crawlerOptions,
            async requestHandler({ request, response, page, enqueueLinks, log, saveSnapshot }) {
                if (response.status() < 200 || response.status() >= 399) {
                    log.error(`Failed ${request.url}'`);

                    await saveResult('visitedUrls', request.url, request.url, false);

                    return;
                }

                log.info(`Crawling ${page.url()}'`);

                await saveResult('visitedUrls', page.url(), page.url(), false);

                if ('FOR_EACH' !== request.label) {
                    await executeActions(scenario.startup || [], page, saveSnapshot, enqueueLinks);
                }

                await executeActions(scenario.forEach || [], page, saveSnapshot, enqueueLinks);
            },

            async failedRequestHandler({request, log}) {
                log.error(`Failed ${request.url}'`);

                await saveResult('visitedUrls', request.url, request.url, false);
            },
        });

        await this.#scenarioRepository.create(scenarioId, scenario);
        await crawler.run([scenario.url]);
        await this.#scenarioRepository.complete(scenarioId);
    }
}
