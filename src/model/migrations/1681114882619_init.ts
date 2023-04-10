/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
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

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('scenario_result');
    pgm.dropTable('scenario');
}
