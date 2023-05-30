import { v4 as uuid, validate as validateUuid } from 'uuid';

export class ScenarioRepository {
    #databaseClient;

    constructor({ databaseClient }) {
        this.#databaseClient = databaseClient;
    }

    async create(scenarioId, config) {
        await this.#databaseClient('scenario')
            .insert({
                id: scenarioId,
                status: 'running',
                config: this.#databaseClient.raw('?::jsonb', [ JSON.stringify(config) ]),
            });
    }

    async fail(scenarioId, error) {
        await this.#databaseClient('scenario')
            .update({
                status: 'failed',
                error: error,
            })
            .where('id', scenarioId);
    }

    async complete(scenarioId) {
        await this.#databaseClient('scenario')
            .update({
                status: 'completed',
            })
            .where('id', scenarioId);
    }

    async get(scenarioId) {
        const scenarioRows = await this.#databaseClient('scenario')
            .select('id', 'created_at', 'status', 'error', 'config')
            .where('id', scenarioId)
            .limit(1);

        if (!scenarioRows.length) {
            return null;
        }

        const scenario = scenarioRows[0];
        scenario.stats = {};
        scenario.results = {};

        const scenarioResultRows = await this.#databaseClient('scenario_result')
            .select('group', 'identity', 'data')
            .where('scenario_id', scenarioId);

        for (let resultRow of scenarioResultRows) {
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

    async list({ filter, limit, offset }) {
        let qb = this.#databaseClient('scenario')
            .select('id', 'created_at', 'status', 'error')
            .orderBy('created_at', 'DESC');

        if ('id' in filter && validateUuid(filter.id)) {
            qb = qb.andWhere('id', filter.id);
        }

        if ('status' in filter) {
            qb = qb.andWhere('status', filter.status);
        }

        if (Number.isInteger(limit)) {
            qb = qb.limit(limit);
        }

        if (Number.isInteger(offset)) {
            qb = qb.offset(offset);
        }

        return qb;
    }

    async count() {
        return Number((await this.#databaseClient('scenario').count('id', { as: 'cnt' }))[0].cnt);
    }

    async addResult(scenarioId, group, identity, data, mergeOnConflict = true) {
        const id = uuid();
        let qb = this.#databaseClient('scenario_result')
            .insert({
                id: id,
                scenario_id: scenarioId,
                group: group,
                identity: identity,
                data: this.#databaseClient.raw('?::jsonb', [ JSON.stringify(data) ]),
            });

        if (mergeOnConflict) {
            qb = qb.onConflict(['scenario_id', 'group', 'identity'])
                .merge({
                    data: this.#databaseClient.raw('scenario_result.data || excluded.data::jsonb'),
                });
        } else {
            qb = qb.onConflict(['scenario_id', 'group', 'identity'])
                .ignore();
        }

        await qb;
    }
}
