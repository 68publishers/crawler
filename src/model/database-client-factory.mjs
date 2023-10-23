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
            afterCreate: async (connection, done) => {
                try {
                    await connection.query('SET timezone="UTC";');

                    done(null, connection);
                } catch (err) {
                    done(err, connection);
                }
            },
        },
    });
}
