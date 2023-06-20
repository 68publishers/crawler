
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('scenario', table => {
        table
            .datetime('finished_at', { useTz: false })
            .nullable()
            .defaultTo(null);
    });

    await knex('scenario')
        .update({
            finished_at: knex.ref('created_at'),
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.alterTable('scenario', table => {
        table.dropColumn('finished_at');
    });
};
