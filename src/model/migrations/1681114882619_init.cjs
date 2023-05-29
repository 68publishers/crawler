/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('scenario', {
        id: {
            type: 'uuid',
            unique: true,
            primaryKey: true,
            notNull: true,
        },
        created_at: {
            type: 'timestamp(0) without time zone',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        status: {
            type: 'varchar(32)',
            notNull: true,
        },
        config: {
            type: 'jsonb',
            notNull: true,
        },
    });

    pgm.createTable('scenario_result', {
        id: {
            type: 'uuid',
            unique: true,
            primaryKey: true,
            notNull: true,
        },
        scenario_id: {
            type: 'uuid',
            notNull: true,
            references: 'scenario',
            onDelete: 'CASCADE',
        },
        identity: {
            type: 'varchar(255)',
            notNull: true,
        },
        group: {
            type: 'varchar(255)',
            notNull: true,
        },
        data: {
            type: 'jsonb',
            notNull: true,
        },
    });

    pgm.createIndex('scenario_result', 'scenario_id', {
        name: 'idx_sr_scenario_id'
    });

    pgm.createIndex('scenario_result', ['scenario_id', 'group', 'identity'], {
        name: 'uniq_sr_scenario_id_group_identity',
        unique: true,
    });
}

exports.down = pgm => {
    pgm.dropTable('scenario_result');
    pgm.dropTable('scenario');
}
