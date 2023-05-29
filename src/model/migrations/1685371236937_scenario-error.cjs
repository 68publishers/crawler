/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('scenario', {
        error: {
            type: 'text',
            notNull: false,
        },
    });
};

exports.down = pgm => {
    pgm.dropColumns('scenario', [
        'error',
    ]);
};
