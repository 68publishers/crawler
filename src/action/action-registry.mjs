export class ActionRegistry {
    #actions;

    constructor() {
        this.#actions = {};
    }

    addAction(action) {
        this.#actions[action.name] = action;
    }

    get(name) {
        if (!(name in this.#actions)) {
            throw new Error(`Unknown action "${name}".`);
        }

        return this.#actions[name];
    }
}
