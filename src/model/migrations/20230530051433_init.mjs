/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.createTable('user', table => {
        table
            .uuid('id')
            .primary()
            .unique()
            .notNullable();
        table
            .datetime('created_at', { useTz: false })
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .string('username', 255)
            .notNullable();
        table
            .string('password', 255)
            .notNullable();
        table
            .string('callback_uri_token', 255)
            .notNullable();
    });

    await knex.schema.createTable('scenario', table => {
        table
            .uuid('id')
            .primary()
            .unique()
            .notNullable();
        table
            .datetime('created_at', { useTz: false })
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .string('status', 32)
            .notNullable();
        table
            .text('error')
            .nullable();
        table
            .jsonb('config')
            .notNullable();
    });

    await knex.schema.createTable('scenario_result', table => {
        table
            .uuid('id')
            .primary()
            .unique()
            .notNullable();
        table
            .uuid('scenario_id')
            .notNullable();
        table
            .string('identity', 255)
            .notNullable();
        table
            .string('group', 255)
            .notNullable();
        table
            .jsonb('data')
            .notNullable();

        table
            .foreign('scenario_id')
            .references('scenario.id')
            .withKeyName('fk_sr_scenario_id')
            .onDelete('CASCADE');

        table.index(['scenario_id'], 'idx_sr_scenario_id');
        table.unique(['scenario_id', 'group', 'identity'], {
            indexName: 'uniq_sr_scenario_id_group_identity',
        });
    });

    await knex.schema.createTable('scenario_scheduler', table => {
        table
            .uuid('id')
            .primary()
            .unique()
            .notNullable();
        table
            .uuid('user_id')
            .notNullable();
        table
            .datetime('created_at', { useTz: false })
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .datetime('updated_at', { useTz: false })
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .string('expression', 255)
            .notNullable();
        table
            .jsonb('config')
            .notNullable();

        table
            .foreign('user_id')
            .references('user.id')
            .withKeyName('fk_sch_user_id')
            .onDelete('RESTRICT');

        table.index(['user_id'], 'idx_sch_user_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.dropTable('scenario_scheduler');
    await knex.schema.dropTable('scenario_result');
    await knex.schema.dropTable('scenario');
    await knex.schema.dropTable('user');
};
