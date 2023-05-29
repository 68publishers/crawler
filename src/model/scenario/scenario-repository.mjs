import { v4 as uuid } from 'uuid';

export class ScenarioRepository {
    #database;

    constructor({ database }) {
        this.#database = database;
    }

    async create(scenarioId, config) {
        await this.#database.query(`
            INSERT INTO scenario (id, status, config) VALUES ($1, $2, $3::jsonb)
        `, [
            scenarioId,
            'running',
            JSON.stringify(config),
        ]);
    }

    async fail(scenarioId, error) {
        await this.#database.query(`
            UPDATE scenario SET status = $1, error = $2 WHERE id = $3
        `, [
            'failed',
            error,
            scenarioId,
        ]);
    }

    async complete(scenarioId) {
        await this.#database.query(`
            UPDATE scenario SET status = $1 WHERE id = $2
        `, [
            'completed',
            scenarioId,
        ]);
    }

    async get(scenarioId) {
        const scenarioRows = await this.#database.query(`
            SELECT id, created_at, status, error FROM scenario WHERE id = $1 LIMIT 1
        `, [
            scenarioId,
        ]);

        if (!scenarioRows.rows.length) {
            return null;
        }

        const scenario = scenarioRows.rows[0];
        scenario.stats = {};
        scenario.results = {};

        const scenarioResultRows = await this.#database.query(`
            SELECT "group", identity, data FROM scenario_result WHERE scenario_id = $1
        `, [
            scenarioId,
        ]);

        for (let resultRow of scenarioResultRows.rows) {
            if (!(resultRow.group in scenario.results)) {
                scenario.results[resultRow.group] = [];
                scenario.stats[resultRow.group] = 0;
            }

            const data = {
                _identity: resultRow.identity,
                ...resultRow.data
            };

            scenario.results[resultRow.group].push(data);
            ++scenario.stats[resultRow.group];
        }

        return scenario;
    }

    async addResult(scenarioId, group, identity, data, mergeOnConflict = true) {
        const id = uuid();

        if (mergeOnConflict) {
            await this.#database.query(`
              INSERT INTO scenario_result (id, scenario_id, "group", identity, data) VALUES ($1, $2, $3, $4, $5::jsonb)
              ON CONFLICT (scenario_id, "group", identity)
              DO UPDATE SET data = scenario_result.data || excluded.data::jsonb
            `, [
                id,
                scenarioId,
                group,
                identity,
                JSON.stringify(data),
            ]);
        } else {
            await this.#database.query(`
              INSERT INTO scenario_result (id, scenario_id, "group", identity, data) VALUES ($1, $2, $3, $4, $5::jsonb)
              ON CONFLICT (scenario_id, "group", identity) DO NOTHING
            `, [
                id,
                scenarioId,
                group,
                identity,
                JSON.stringify(data),
            ]);
        }
    }
}
