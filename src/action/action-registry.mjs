import { Click } from './click.mjs';
import { ClickWithRedirect } from './click-with-redirect.mjs';
import { CollectCookies } from './collect-cookies.mjs';
import { CollectData } from './collect-data.mjs';
import { Delay } from './delay.mjs';
import { EnqueueLinks } from './enqueue-links.mjs';
import { EnqueueLinksByClicking } from './enqueue-links-by-clicking.mjs';
import { Focus } from './focus.mjs';
import { Hover } from './hover.mjs';
import { KeyboardPress } from './keyboard-press.mjs';
import { RunScene } from './run-scene.mjs';
import { RunSceneConditionally } from './run-scene-conditionally.mjs';
import { Screenshot } from './screenshot.mjs';
import { Select } from './select.mjs';
import { SetIdentity } from './set-identity.mjs';
import { Type } from './type.mjs';
import { WaitForSelector } from './wait-for-selector.mjs';

export class ActionRegistry {
    #actions;

    constructor({ applicationUrl }) {
        this.#actions = {};

        this.#addAction(new Click());
        this.#addAction(new ClickWithRedirect());
        this.#addAction(new CollectCookies());
        this.#addAction(new CollectData());
        this.#addAction(new Delay());
        this.#addAction(new EnqueueLinks());
        this.#addAction(new EnqueueLinksByClicking());
        this.#addAction(new Focus());
        this.#addAction(new Hover());
        this.#addAction(new KeyboardPress());
        this.#addAction(new RunScene());
        this.#addAction(new RunSceneConditionally());
        this.#addAction(new Screenshot({ applicationUrl }));
        this.#addAction(new Select());
        this.#addAction(new SetIdentity());
        this.#addAction(new Type());
        this.#addAction(new WaitForSelector());
    }

    get(name) {
        if (!(name in this.#actions)) {
            throw new Error(`Unknown action "${name}".`);
        }

        return this.#actions[name];
    }

    #addAction(action) {
        this.#actions[action.name] = action;
    }
}
