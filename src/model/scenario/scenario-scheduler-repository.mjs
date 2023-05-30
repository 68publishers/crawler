import {v4 as uuid, validate as validateUuid} from 'uuid';

export class ScenarioSchedulerRepository {
    #databaseClient;

    constructor({ databaseClient }) {
        this.#databaseClient = databaseClient;
    }

    async create(userId, expression, config, scenarioSchedulerId = undefined) {
        scenarioSchedulerId = scenarioSchedulerId || uuid();

        await this.#databaseClient('scenario_scheduler')
            .insert({
                id: scenarioSchedulerId,
                user_id: userId,
                expression: expression,
                config: this.#databaseClient.raw('?::jsonb', [ JSON.stringify(config) ]),
            });

        return scenarioSchedulerId;
    }

    async update(scenarioSchedulerId, userId, expression, config, transaction = undefined) {
        let qb = this.#databaseClient('scenario_scheduler')
            .update({
                user_id: userId,
                expression: expression,
                updated_at: this.#databaseClient.raw('CURRENT_TIMESTAMP'),
                config: this.#databaseClient.raw('?::jsonb', [ JSON.stringify(config) ]),
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
            .select('id', 'user_id', 'created_at', 'updated_at', 'expression', 'config')
            .where('id', scenarioSchedulerId)
            .limit(1);

        return !scenarioSchedulerRows.length ? null : scenarioSchedulerRows[0];
    }

    async findByUserId(userId) {
        return await this.#databaseClient('scenario_scheduler')
            .select('id', 'user_id', 'created_at', 'updated_at', 'expression', 'config')
            .where('user_id', userId);
    }

    async exists(scenarioSchedulerId) {
        const existsRows = await this.#databaseClient('scenario_scheduler')
            .select(this.#databaseClient.raw('1'))
            .where('id', scenarioSchedulerId)
            .limit(1);

        return !!existsRows.length
    }

    async list({ filter, limit, offset }) {
        let qb = this.#databaseClient('scenario_scheduler')
            .select('id', 'user_id', 'created_at', 'updated_at', 'expression', 'config')
            .orderBy('created_at', 'DESC');

        if ('id' in filter && validateUuid(filter.id)) {
            qb = qb.andWhere('id', filter.id);
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
        return Number((await this.#databaseClient('scenario_scheduler').count('id', { as: 'cnt' }))[0].cnt);
    }
}
