
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('scenario', table => {
        table
            .uuid('user_id')
            .nullable();

        table
            .foreign('user_id')
            .references('user.id')
            .withKeyName('fk_s_user_id')
            .onDelete('SET NULL');

        table.index(['user_id'], 'idx_s_user_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.alterTable('scenario', table => {
        table.dropColumn('user_id');
    });
};
