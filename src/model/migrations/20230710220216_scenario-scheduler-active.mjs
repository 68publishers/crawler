
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('scenario_scheduler', table => {
        table
            .boolean('active')
            .nullable();
    });

    const rows = await knex('scenario_scheduler')
        .select('id');

    for (let row of rows) {
        await knex('scenario_scheduler')
            .update({
                active: true,
            })
            .where('id', row.id);
    }

    await knex.schema.alterTable('scenario_scheduler', table => {
        table
            .boolean('active')
            .notNullable()
            .alter();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.alterTable('scenario_scheduler', table => {
        table.dropColumn('active');
    });
};
