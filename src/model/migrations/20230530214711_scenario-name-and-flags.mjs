
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('scenario', table => {
        table
            .string('name', 255)
            .notNullable();
        table
            .jsonb('flags')
            .notNullable();
    });

    await knex.schema.alterTable('scenario_scheduler', table => {
        table
            .string('name', 255)
            .notNullable();
        table
            .jsonb('flags')
            .notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.alterTable('scenario', table => {
        table.dropColumn('name');
        table.dropColumn('flags');
    });

    await knex.schema.alterTable('scenario_scheduler', table => {
        table.dropColumn('name');
        table.dropColumn('flags');
    });
};
