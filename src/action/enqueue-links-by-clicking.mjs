import {AbstractAction} from './abstract-action.mjs';

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

    async execute(options, { request, enqueueLinksByClickingElements }) {
        await enqueueLinksByClickingElements({
            selector: options.selector,
            userData: {
                scene: options.scene,
                previousUrl: request.userData.currentUrl,
                identity: request.userData.identity,
            },
        });
    }
}
