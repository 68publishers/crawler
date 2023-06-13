import { v4 as uuid, validate as validateUuid } from 'uuid';
import { ScenarioResultGroups } from './scenario-result-groups.mjs';

export class ScenarioRepository {
    #databaseClient;

    constructor({ databaseClient }) {
        this.#databaseClient = databaseClient;
    }

    async create(scenarioId, userId, name, flags, config) {
        await this.#databaseClient('scenario')
            .insert({
                id: scenarioId,
                user_id: userId,
                status: 'waiting',
                name: name,
                flags: JSON.stringify(flags),
                config: JSON.stringify(config),
            });
    }

    async markAsRunning(scenarioId) {
        await this.#databaseClient('scenario')
            .update({
                status: 'running',
            })
            .where('id', scenarioId);
    }

    async markAsFailed(scenarioId, error) {
        await this.#databaseClient('scenario')
            .update({
                status: 'failed',
                error: error,
            })
            .where('id', scenarioId);
    }

    async markAdCompleted(scenarioId) {
        await this.#databaseClient('scenario')
            .update({
                status: 'completed',
            })
            .where('id', scenarioId);
    }

    async get(scenarioId, withResults = true) {
        const scenarioRows = await this.#databaseClient('scenario')
            .select(
                'scenario.id',
                'user.id AS userId',
                'user.username AS username',
                'scenario.name',
                'scenario.created_at AS createdAt',
                'scenario.status',
                'scenario.error',
                'scenario.flags',
                'scenario.config',
            )
            .leftJoin('user', 'scenario.user_id', '=', 'user.id')
            .where('scenario.id', scenarioId)
            .limit(1);

        if (!scenarioRows.length) {
            return null;
        }

        const scenario = scenarioRows[0];
        scenario.stats = ScenarioResultGroups.ALL.reduce((accumulator, value) => ({...accumulator, [value]: 0}), {});
        scenario.results = ScenarioResultGroups.ALL.reduce((accumulator, value) => ({...accumulator, [value]: []}), {});

        if (!withResults) {
            return scenario;
        }

        const scenarioResultRows = await this.#databaseClient('scenario_result')
            .select('group', 'identity', 'data')
            .where('scenario_id', scenarioId)
            .orderBy('created_at', 'ASC');

        for (let resultRow of scenarioResultRows) {
            const data = {
                identity: resultRow.identity,
                ...resultRow.data,
            };

            scenario.results[resultRow.group].push(data);
            ++scenario.stats[resultRow.group];
        }

        return scenario;
    }

    async list({ filter, limit, offset }) {
        let qb = this.#databaseClient('scenario')
            .select(
                'scenario.id',
                'user.id AS userId',
                'user.username AS username',
                'scenario.name',
                'scenario.created_at AS createdAt',
                'scenario.status',
                'scenario.error',
                'scenario.flags',
            )
            .leftJoin('user', 'scenario.user_id', '=', 'user.id')
            .orderBy('scenario.created_at', 'DESC');

        qb = this.#applyFilter(qb, filter || {});

        Number.isInteger(limit) && (qb = qb.limit(limit));
        Number.isInteger(offset) && (qb = qb.offset(offset));

        return qb;
    }

    async count({ filter }) {
        let qb = this.#databaseClient('scenario')
            .leftJoin('user', 'scenario.user_id', '=', 'user.id')
            .count('scenario.id', { as: 'cnt' });

        qb = this.#applyFilter(qb, filter || {});

        return Number((await qb)[0].cnt);
    }

    async addResult(scenarioId, group, identity, data, mergeOnConflict = true) {
        const id = uuid();
        let qb = this.#databaseClient('scenario_result')
            .insert({
                id: id,
                scenario_id: scenarioId,
                group: group,
                identity: identity,
                data: JSON.stringify(data),
            });

        if (mergeOnConflict) {
            qb = qb.onConflict(['scenario_id', 'group', 'identity'])
                .merge({
                    data: this.#databaseClient.raw('jsonb_merge_with_arrays(scenario_result.data, excluded.data::jsonb)'),
                });
        } else {
            qb = qb.onConflict(['scenario_id', 'group', 'identity'])
                .ignore();
        }

        await qb;
    }

    #applyFilter(qb, filter) {
        ('id' in filter && validateUuid(filter.id)) && (qb = qb.andWhere('scenario.id', filter.id));
        ('userId' in filter && validateUuid(filter.userId)) && (qb = qb.andWhere('user.id', filter.userId));
        ('username' in filter) && (qb = qb.andWhereILike('user.username', `%${filter.username}%`));
        ('name' in filter) && (qb = qb.andWhereILike('scenario.name', `%${filter.name}%`));
        ('status' in filter) && (qb = qb.andWhere('scenario.status', filter.status));
        ('flags' in filter) && (qb = qb.whereJsonSupersetOf('scenario.flags', filter.flags));

        return qb;
    }
}
