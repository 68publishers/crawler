import {AbstractAction} from './abstract-action.mjs';

export class CollectCookies extends AbstractAction {
    constructor() {
        super('collectCookies');
    }

    *_doValidateOptions(options) {}

    async execute(options, { page, saveResult }) {
        const client = await page.target().createCDPSession();
        const cookies = (await client.send('Storage.getCookies')).cookies;
        const pageUrl = page.url();

        for (let cookie of cookies) {
            const identity = cookie.name + '__' + cookie.domain;

            await saveResult('cookies', identity, {
                name: cookie.name,
                domain: cookie.domain,
                foundOnUrl: pageUrl,
                httpOnly: cookie.httpOnly || false,
                secure: cookie.secure || false,
                session: cookie.session || false,
                sameSite: cookie.sameSite || null,
            }, false);
        }
    }
}
