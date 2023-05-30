import knex from 'knex';

export function createDatabaseClient({ dbUrl }) {
    return knex({
        client: 'pg',
        connection: dbUrl,
        pool: {
            min: 2,
            max: 10,
        }
    });
}
