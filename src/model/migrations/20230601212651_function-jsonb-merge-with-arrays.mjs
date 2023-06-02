
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.raw(`
        CREATE FUNCTION jsonb_merge_with_arrays(A jsonb, B jsonb)
            RETURNS jsonb LANGUAGE SQL AS $$
            SELECT
                jsonb_object_agg(
                    coalesce(ka, kb),
                    CASE
                        WHEN va isnull THEN vb
                        WHEN vb isnull THEN va
                        WHEN jsonb_typeof(va) = 'array' AND jsonb_typeof(vb) = 'array' THEN (
                            SELECT
                                to_jsonb(
                                    array_agg(unique_values.value order by unique_values.index)
                                )
                            FROM (
                                SELECT x.value, min(x.index) AS index
                                FROM jsonb_array_elements(va || vb) WITH ORDINALITY AS x(value, index)
                                GROUP BY x.value
                            ) unique_values
                        )
                        WHEN jsonb_typeof(va) <> 'object' OR jsonb_typeof(vb) <> 'object' THEN vb
                        ELSE jsonb_merge_with_arrays(va, vb)
                    END
                )
            FROM jsonb_each(A) temptable1(ka, va)
            FULL JOIN jsonb_each(B) temptable2(kb, vb) ON ka = kb
        $$;
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.raw('DROP FUNCTION jsonb_merge_with_arrays;');
};
