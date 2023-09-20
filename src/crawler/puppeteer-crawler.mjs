import { PuppeteerCrawler as CrawleePuppeteerCrawler } from 'crawlee';

export class PuppeteerCrawler extends CrawleePuppeteerCrawler {
    async _navigationHandler(crawlingContext, gotoOptions) {
        const { page, request } = crawlingContext;

        let cookiesToTransfer = request.userData.transferredCookies;

        if (0 < cookiesToTransfer.length) {
            const session = await page.target().createCDPSession();

            await session.send('Network.setCookies', {
                cookies: cookiesToTransfer,
            });

            await session.detach();
        }

        return super._navigationHandler(crawlingContext, gotoOptions);
    }
}
