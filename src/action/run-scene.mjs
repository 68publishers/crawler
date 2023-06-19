import { AbstractAction } from './abstract-action.mjs';

export class RunScene extends AbstractAction {
    constructor() {
        super('runScene');
    }

    *_doValidateOptions({ options, sceneNames }) {
        if (('scene' in options) && 'string' === typeof options.scene) {
            if (!sceneNames.includes(options.scene)) {
                yield `the option "scene" contains undefined scene name "${options.scene}"`;
            }
        } else {
            yield `the option "scene" is required and must be a scene name`;
        }
    }

    async execute(options, executionContext) {
        const scene = options.scene;
        executionContext.logger.info(`Running sub-scene "${scene}" for URL ${executionContext.request.userData.currentUrl}`);

        await executionContext.runScene(scene);
    }
}
