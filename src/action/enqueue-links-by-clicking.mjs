import { AbstractAction } from './abstract-action.mjs';

export class EnqueueLinksByClicking extends AbstractAction {
    constructor() {
        super('enqueueLinksByClicking');
    }

    *_doValidateOptions({ options, sceneNames }) {
        if (('scene' in options) && 'string' === typeof options.scene) {
            if (!sceneNames.includes(options.scene)) {
                yield `the option "scene" contains undefined scene name "${options.scene}"`;
            }
        } else {
            yield `the option "scene" is required and must be a scene name`;
        }

        if (!('selector' in options) || 'string' !== typeof options.selector) {
            yield 'the option "selector" is required and must be a string';
        }
    }

    async execute(options, { scenarioOptions, request, page, enqueueLinksByClickingElements, browserController }) {
        const transferredCookieNames = ('session' in scenarioOptions && 'transferredCookies' in scenarioOptions.session) ? scenarioOptions.session.transferredCookies : [];
        let transferredCookies = [];

        if (Array.isArray(transferredCookieNames) && 0 < transferredCookieNames.length) {
            const cookies = (await browserController.getCookies(page))
                .filter(cookie => transferredCookieNames.includes(cookie.name));

            if (0 < cookies.length) {
                transferredCookies = cookies;
            }
        }

        await enqueueLinksByClickingElements({
            selector: options.selector,
            userData: {
                scene: options.scene,
                previousUrl: request.userData.currentUrl,
                identity: request.userData.identity,
                transferredCookies: transferredCookies,
            },
        });
    }
}
