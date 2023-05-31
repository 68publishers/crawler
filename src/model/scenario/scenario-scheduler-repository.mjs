import {v4 as uuid, validate as validateUuid} from 'uuid';

export class ScenarioSchedulerRepository {
    #databaseClient;

    constructor({ databaseClient }) {
        this.#databaseClient = databaseClient;
    }

    async create(userId, name, flags, expression, config, scenarioSchedulerId = undefined) {
        scenarioSchedulerId = scenarioSchedulerId || uuid();

        await this.#databaseClient('scenario_scheduler')
            .insert({
                id: scenarioSchedulerId,
                user_id: userId,
                name: name,
                flags: JSON.stringify(flags),
                expression: expression,
                config: JSON.stringify(config),
            });

        return scenarioSchedulerId;
    }

    async update(scenarioSchedulerId, userId, name, flags, expression, config, transaction = undefined) {
        let qb = this.#databaseClient('scenario_scheduler')
            .update({
                user_id: userId,
                name: name,
                flags: flags,
                expression: expression,
                updated_at: this.#databaseClient.raw('CURRENT_TIMESTAMP'),
                config: JSON.stringify(config),
            })
            .where('id', scenarioSchedulerId)
            .returning(['id']);

        if (transaction) {
            qb = qb.transacting(transaction);
        }

        return 0 < (await qb).length;
    }

    async delete(scenarioSchedulerId) {
        const affectedRows = await this.#databaseClient('scenario_scheduler')
            .where('id', scenarioSchedulerId)
            .delete();

        return 0 < affectedRows;
    }

    async get(scenarioSchedulerId) {
        const scenarioSchedulerRows = await this.#databaseClient('scenario_scheduler')
            .select(
                'scenario_scheduler.id',
                'user.id AS userId',
                'user.username AS username',
                'scenario_scheduler.name',
                'scenario_scheduler.created_at AS createdAt',
                'scenario_scheduler.updated_at AS updatedAt',
                'scenario_scheduler.expression',
                'scenario_scheduler.flags',
                'scenario_scheduler.config',
            )
            .join('user', 'scenario_scheduler.user_id', '=', 'user.id')
            .where('scenario_scheduler.id', scenarioSchedulerId)
            .limit(1);

        return !scenarioSchedulerRows.length ? null : scenarioSchedulerRows[0];
    }

    async findByUserId(userId) {
        return await this.#databaseClient('scenario_scheduler')
            .select(
                'scenario_scheduler.id',
                'user.id AS userId',
                'user.username AS username',
                'scenario_scheduler.name',
                'scenario_scheduler.created_at AS createdAt',
                'scenario_scheduler.updated_at AS updatedAt',
                'scenario_scheduler.expression',
                'scenario_scheduler.flags',
                'scenario_scheduler.config',
            )
            .join('user', 'scenario_scheduler.user_id', '=', 'user.id')
            .where('scenario_scheduler.user_id', userId);
    }

    async list({ filter, limit, offset }, withConfigs = false) {
        const columns = [
            'scenario_scheduler.id',
            'user.id AS userId',
            'user.username AS username',
            'scenario_scheduler.name',
            'scenario_scheduler.created_at AS createdAt',
            'scenario_scheduler.updated_at AS updatedAt',
            'scenario_scheduler.expression',
            'scenario_scheduler.flags',
        ];

        if (withConfigs) {
            columns.push('scenario_scheduler.config');
        }

        let qb = this.#databaseClient('scenario_scheduler')
            .select(...columns)
            .join('user', 'scenario_scheduler.user_id', '=', 'user.id')
            .orderBy('scenario_scheduler.created_at', 'DESC');

        qb = this.#applyFilter(qb, filter || {});

        Number.isInteger(limit) && (qb = qb.limit(limit));
        Number.isInteger(offset) && (qb = qb.offset(offset));

        return (await qb);
    }

    async count({ filter }) {
        let qb = this.#databaseClient('scenario_scheduler')
            .join('user', 'scenario_scheduler.user_id', '=', 'user.id')
            .count('scenario_scheduler.id', { as: 'cnt' });

        qb = this.#applyFilter(qb, filter || {});

        return Number((await qb)[0].cnt);
    }

    #applyFilter(qb, filter) {
        ('id' in filter && validateUuid(filter.id)) && (qb = qb.andWhere('scenario_scheduler.id', filter.id));
        ('userId' in filter && validateUuid(filter.userId)) && (qb = qb.andWhere('user.id', filter.userId));
        ('username' in filter) && (qb = qb.andWhereILike('user.username', `%${filter.username}%`));
        ('name' in filter) && (qb = qb.andWhereILike('scenario_scheduler.name', `%${filter.name}%`));
        ('flags' in filter) && (qb = qb.whereJsonSupersetOf('scenario_scheduler.flags', filter.flags));

        return qb;
    }
}
