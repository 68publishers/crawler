import {v4 as uuid} from 'uuid';

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

    async complete(scenarioId) {
        await this.#database.query(`
            UPDATE scenario SET status = $1 WHERE id = $2
        `, [
            'done',
            scenarioId,
        ]);
    }

    async get(scenarioId) {
        const scenarioRows = await this.#database.query(`
            SELECT id, created_at, status FROM scenario WHERE id = $1 LIMIT 1
        `, [
            scenarioId,
        ]);

        if (!scenarioRows.rows.length) {
            return null;
        }

        const scenario = scenarioRows.rows[0];
        scenario.results = {};

        const scenarioResultRows = await this.#database.query(`
            SELECT identity, result FROM scenario_result WHERE scenario_id = $1
        `, [
            scenarioId,
        ]);

        for (let resultRow of scenarioResultRows.rows) {
            scenario.results[resultRow.identity] = resultRow.result;
        }

        return scenario;
    }

    async addResult(scenarioId, identity, result, mergeOnConflict = true) {
        const id = uuid();

        if (mergeOnConflict) {
            await this.#database.query(`
              INSERT INTO scenario_result (id, scenario_id, identity, result) VALUES ($1, $2, $3, $4::jsonb)
              ON CONFLICT (scenario_id, identity)
              DO UPDATE SET result = (
                SELECT array_agg(DISTINCT x) FROM unnest(scenario_result.result || excluded.result::jsonb) x
              );
            `, [
                id,
                scenarioId,
                identity,
                result,
            ]);
        } else {
            await this.#database.query(`
              INSERT INTO scenario_result (id, scenario_id, identity, result) VALUES ($1, $2, $3, $4::jsonb)
              ON CONFLICT (scenario_id, identity) DO NOTHING
            `, [
                id,
                scenarioId,
                identity,
                result,
            ]);
        }
    }
}
