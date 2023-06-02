export class ScenarioResultGroups {
    static get VISITED_URLS() {
        return 'visitedUrls';
    }

    static get DATA() {
        return 'data';
    }

    static get COOKIES() {
        return 'cookies';
    }

    static get SCREENSHOTS() {
        return 'screenshots';
    }

    static get ALL() {
        return [
            ScenarioResultGroups.VISITED_URLS,
            ScenarioResultGroups.DATA,
            ScenarioResultGroups.COOKIES,
            ScenarioResultGroups.SCREENSHOTS,
        ];
    }
}
