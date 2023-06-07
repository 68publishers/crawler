
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    const rows = await knex('scenario_result')
        .select('id', 'data')
        .where('group', 'data')
        .orderBy('created_at', 'ASC');

    for (let row of rows) {
        const data = row.data;
        const foundOnUrl = data.foundOnUrl || {};

        if (data.foundOnUrl) {
            delete data.foundOnUrl;
        }

        const newData = {
            foundOnUrl,
            values: data,
        };

        await knex('scenario_result')
            .update({
                data: JSON.stringify(newData),
            })
            .where('id', row.id);
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    const rows = await knex('scenario_result')
        .select('id', 'data')
        .where('group', 'data')
        .orderBy('created_at', 'ASC');

    for (let row of rows) {
        const data = row.data;
        const newData = {
            ...data.values,
            foundOnUrl: data.foundOnUrl || {},
        };

        await knex('scenario_result')
            .update({
                data: JSON.stringify(newData),
            })
            .where('id', row.id);
    }
};
