import {AbstractAction} from './abstract-action.mjs';
import { ScenarioResultGroups } from '../model/scenario/scenario-result-groups.mjs';
import { sha256 } from '../helper/hash.mjs';

export class CollectCookies extends AbstractAction {
    constructor() {
        super('collectCookies');
    }

    async execute(options, { request, page, saveResult }) {
        const client = await page.target().createCDPSession();
        const cookies = (await client.send('Storage.getCookies')).cookies;

        for (let cookie of cookies) {
            const identity = sha256(cookie.name + '__' + cookie.domain);

            await saveResult(ScenarioResultGroups.COOKIES, identity, {
                name: cookie.name,
                domain: cookie.domain,
                httpOnly: cookie.httpOnly || false,
                secure: cookie.secure || false,
                session: cookie.session || false,
                sameSite: cookie.sameSite || null,
                foundOnUrl: request.userData.currentUrl,
            }, false);
        }
    }
}
