/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('user', {
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
        username: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        password: {
            type: 'varchar(255)',
            notNull: true,
        },
        callback_uri_token: {
            type: 'varchar(255)',
            notNull: true,
        },
    });
};

exports.down = pgm => {
    pgm.dropTable('user');
};
