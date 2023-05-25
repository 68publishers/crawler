import {ActionRegistry} from './action-registry.mjs';
import {Click} from './click.mjs';
import {ClickWithRedirect} from './click-with-redirect.mjs';
import {CollectCookies} from './collect-cookies.mjs';
import {Delay} from './delay.mjs';
import {EnqueueLinks} from './enqueue-links.mjs';
import {Focus} from './focus.mjs';
import {Hover} from './hover.mjs';
import {KeyboardPress} from './keyboard-press.mjs';
import {Screenshot} from './screenshot.mjs';
import {Select} from './select.mjs';
import {Type} from './type.mjs';
import {WaitForSelector} from './wait-for-selector.mjs';

export function createActionRegistry({ applicationUrl }) {
    const registry = new ActionRegistry();

    registry.addAction(new Click());
    registry.addAction(new ClickWithRedirect());
    registry.addAction(new CollectCookies());
    registry.addAction(new Delay());
    registry.addAction(new EnqueueLinks());
    registry.addAction(new Focus());
    registry.addAction(new Hover());
    registry.addAction(new KeyboardPress());
    registry.addAction(new Screenshot({ applicationUrl }));
    registry.addAction(new Select());
    registry.addAction(new Type());
    registry.addAction(new WaitForSelector());

    return registry;
}
