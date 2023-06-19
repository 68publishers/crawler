import { IsElementVisible } from './is-element-visible.mjs';

export class ConditionRegistry {
    #conditions;

    constructor() {
        this.#conditions = {};

        this.#addCondition(new IsElementVisible());
    }

    /**
     * @returns {AbstractCondition}
     */
    get(name) {
        if (!(name in this.#conditions)) {
            throw new Error(`Unknown condition "${name}".`);
        }

        return this.#conditions[name];
    }

    #addCondition(action) {
        this.#conditions[action.name] = action;
    }
}
