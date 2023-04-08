const Crawlee = require('crawlee');
const puppeteerExtra = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteerExtra.use(stealthPlugin());

const maxLimit = 200;
const viewport = [1920, 1080];

// cmp hp
/*const url = 'http://167.71.46.104:8888/sign-in';
const startupActions = [
    {type: 'screenshot', options: {name: 'startup'}},
    {type: 'click', options: {selector: '#c-p-bn', button: 'left', clickCount: 1, delay: 0, xpath: false}},
    {type: 'delay', options: {delay: 1000}},
    {type: 'collectCookies', options: {}},
];
const eachPageActions = [
    {type: 'screenshot', options: {name: '%url%'}},
    {type: 'delay', options: {delay: 1000}},
    {type: 'collectCookies', options: {}},
];*/

// cmp-login
/*const url = 'http://167.71.46.104:8888/sign-in';
const startupActions = [
    {type: 'screenshot', options: {name: 'startup'}},
    {type: 'click', options: {selector: '#c-p-bn', button: 'left', clickCount: 1, delay: 0, xpath: false}},
    {type: 'delay', options: {delay: 1000}},
    {type: 'type', options: {selector: '#frm-signIn-form-username', text: 'admin@68publishers.io', delay: 0}},
    {type: 'type', options: {selector: '#frm-signIn-form-password', text: 'admin', delay: 0}},
    {type: 'clickWithRedirect', options: {selector: '#frm-signIn-form button[type="submit"]', delay: 0, xpath: false, waitUntil: 'networkidle0'}},
    {type: 'screenshot', options: {name: 'logged-in'}},
    {type: 'collectCookies', options: {}},
    {type: 'enqueueLinks', options: {strategy: 'same-hostname', limit: 20, exclude: []}}
];

const eachPageActions = [
    {type: 'screenshot', options: {name: '%url%'}},
    {type: 'delay', options: {delay: 2000}},
    {type: 'collectCookies', options: {}},
    {type: 'enqueueLinks', options: {strategy: 'same-hostname', limit: 20, exclude: []}}
];*/

/*const url = 'https://www.google.com/search?q=datart.cz';
const startupActions = [
    {type: 'screenshot', options: {name: 'google-consent'}},
    {type: 'click', options: {selector: '//div[@role="dialog"]//button/div[contains(., "Přijmout vše")]', button: 'left', clickCount: 1, delay: 300, xpath: true}},
    {type: 'delay', options: {delay: 1000}},
    {type: 'screenshot', options: {name: 'google-search'}},
    {type: 'clickWithRedirect', options: {selector: '#tads [role="heading"]', delay: 300, xpath: false, waitUntil: 'networkidle0'}},
    {type: 'screenshot', options: {name: 'datart-consent'}},
    {type: 'click', options: {selector: '#c-p-bn', button: 'left', clickCount: 1, delay: 0, xpath: false}},
    {type: 'delay', options: {delay: 2000}},
    {type: 'screenshot', options: {name: 'datart-homepage'}},
    {type: 'collectCookies', options: {}},
    {type: 'enqueueLinks', options: {strategy: 'same-hostname', limit: null, exclude: []}}
];
const eachPageActions = [
    {type: 'screenshot', options: {name: '%url%'}},
    {type: 'delay', options: {delay: 2000}},
    {type: 'collectCookies', options: {}},
    {type: 'enqueueLinks', options: {strategy: 'same-hostname', limit: null, exclude: []}}
];*/

const url = 'https://www.datart.cz/';
const startupActions = [
    {type: 'screenshot', options: {name: 'datart-consent'}},
    {type: 'click', options: {selector: '#c-p-bn', button: 'left', clickCount: 1, delay: 0, xpath: false}},
    {type: 'delay', options: {delay: 2000}},
    {type: 'screenshot', options: {name: 'datart-homepage'}},
    {type: 'collectCookies', options: {}},
    {type: 'enqueueLinks', options: {strategy: 'same-hostname', limit: null, exclude: []}}
];
const eachPageActions = [
    {type: 'screenshot', options: {name: '%url%'}},
    {type: 'delay', options: {delay: 2000}},
    {type: 'collectCookies', options: {}},
    {type: 'enqueueLinks', options: {strategy: 'same-hostname', limit: null, exclude: []}}
];

const executeActions = async (page, actions, saveSnapshot, enqueueLinks) => {
    for (let action of actions) {
        const actionType = action.type;
        const actionOptions = action.options;

        await executeAction(page, actionType, actionOptions, saveSnapshot, enqueueLinks);
    }
};

const executeAction = async (page, type, options, saveSnapshot, enqueueLinks) => {
    try {
        switch (type) {
            case 'click':
                const clickOptions = {
                    button: options.button,
                    clickCount: options.clickCount,
                    delay: options.delay,
                };

                if (options.xpath) {
                    const [button] = await page.$x(options.selector);
                    await button.click(clickOptions);
                } else {
                    await page.click(options.selector, clickOptions);
                }
                break;
            case 'clickWithRedirect':
                if (options.xpath) {
                    const [button] = await page.$x(options.selector);
                    await Promise.all([
                        page.waitForNavigation({
                            waitUntil: options.waitUntil,
                        }),
                        button.click({
                            delay: options.delay,
                        }),
                    ]);

                    break;
                }

                await Promise.all([
                    page.waitForNavigation({
                        waitUntil: options.waitUntil,
                    }),
                    page.click(options.selector, {
                        delay: options.delay,
                    }),
                ]);
                break;
            case 'delay':
                await new Promise(r => setTimeout(r, options.delay));
                break;
            case 'focus':
                await page.focus(options.selector);
                break;
            case 'hover':
                await page.hover(options.selector);
                break;
            case 'keyboardPress':
                await page.keyboard.press(options.key);
                break;
            case 'screenshot':
                await saveSnapshot({
                    key: options.name.replace('%url%', page.url().replace(/[^a-zA-Z0-9!\-_.'()]/g, '-')),
                    saveScreenshot: true,
                    saveHtml: false,
                });
                break;
            case 'select':
                await page.select(options.selector, options.value);
                break;
            case 'type':
                await page.type(options.selector, options.text, {
                    delay: options.delay,
                });
                break;
            case 'waitForNavigation':
                await page.waitForNavigation({
                    waitUntil: options.waitUntil,
                });
                break;
            case 'waitForSelector':
                await page.waitForSelector(options.selector, {
                    hidden: options.hidden,
                    visible: options.visible,
                });
                break;
            case 'collectCookies':
                const client = await page.target().createCDPSession();
                await Crawlee.Dataset.pushData({
                    url: page.url(),
                    cookies: (await client.send('Storage.getCookies')).cookies,
                });
                break;
            case 'enqueueLinks':
                const enqueueLinksOptions = {
                    selector: 'a',
                    strategy: options.strategy,
                    exclude: options.exclude,
                    label: 'EACH_PAGE',
                    baseUrl: (new URL(page.url())).origin,
                };

                if (null !== options.limit) {
                    enqueueLinksOptions.limit = options.limit;
                }

                await enqueueLinks(enqueueLinksOptions);
        }
    } catch (e) {
        e.message = `Error during scenario action ${JSON.stringify({type: type, options: options})}: ` + e.message;

        throw e;
    }
};

const crawlerOptions = {
    maxRequestRetries: 0,
    launchContext: {
        launcher: puppeteerExtra,
        launchOptions: {
            headless: true,
            ignoreHTTPSErrors: true,
            executablePath: '/usr/bin/chromium-browser',
            args: [
                '--disable-web-security'
            ],
            defaultViewport: {
                width: viewport[0],
                height: viewport[1],
            }
        },
    },
    preNavigationHooks: [
        (crawlingContext, gotoOptions) => {
            gotoOptions.waitUntil = 'networkidle0';
        },
    ]
};

if (null !== maxLimit) {
    crawlerOptions.maxRequestsPerCrawl = maxLimit;
}

const crawler = new Crawlee.PuppeteerCrawler({
    ...crawlerOptions,
    async requestHandler({ request, response, page, enqueueLinks, log, saveSnapshot }) {
        if (response.status() < 200 || response.status() >= 399) {
            log.error(`Failed ${request.url}'`);

            return;
        }

        log.info(`Crawling ${page.url()}'`);

        const actions = 'EACH_PAGE' === request.label ? eachPageActions : startupActions;

        await executeActions(page, actions, saveSnapshot, enqueueLinks);
    },

    async failedRequestHandler({request, log}) {
        log.error(`Failed ${request.url}'`);
    },
});

crawler.run([url]).then(async () => {
    const allData = (await Crawlee.Dataset.getData()).items;
    const cookies = {};

    for (let i in allData) {
        const data = allData[i];

        for (let j in (data.cookies || [])) {
            const cookie = data.cookies[j];
            const key = cookie.name + '---' + cookie.domain;

            if (!(key in cookies)) {
                cookies[key] = {
                    name: cookie.name,
                    domain: cookie.domain,
                };
            }
        }
    }

    const cookiesData = Object.values(cookies);

    await Crawlee.Dataset.pushData({
        total: cookiesData.length,
        cookies: cookiesData,
    });
});
