import knex from 'knex';

export function createDatabaseClient({ dbUrl }) {
    return knex({
        client: 'pg',
        connection: dbUrl,
        pool: {
            min: 0,
            max: 10,
            acquireTimeoutMillis: 60000,
            idleTimeoutMillis: 600000,
        },
    });
}
