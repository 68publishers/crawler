import { v4 as uuid, validate as validateUuid } from 'uuid';
import { hashPassword } from '../../helper/password.mjs';
import { randomBytes } from 'node:crypto';

export class UserRepository {
    #database;

    constructor({ database }) {
        this.#database = database;
    }

    async create(username, password) {
        await this.#database.query(`
            INSERT INTO "user" (id, username, password, callback_uri_token) VALUES ($1, $2, $3, $4)
        `, [
            uuid(),
            username,
            hashPassword(password),
            randomBytes(24).toString('hex'),
        ]);
    }

    async findById(id) {
        if (!validateUuid(id)) {
            return null;
        }

        const result = await this.#database.query(`
            SELECT id, created_at, username, password, callback_uri_token FROM "user" WHERE id = $1 LIMIT 1
        `, [
            id,
        ]);

        return 0 >= result.rows.length ? null : result.rows[0];
    }

    async findByUsername(username) {
        const result = await this.#database.query(`
            SELECT id, created_at, username, password, callback_uri_token FROM "user" WHERE username = $1 LIMIT 1
        `, [
            username,
        ]);

        return 0 >= result.rows.length ? null : result.rows[0];
    }

    async delete(id) {
        if (!validateUuid(id)) {
            return 0;
        }

        return 0 < (await this.#database.query(`
            DELETE FROM "user" WHERE id = $1
        `, [
            id,
        ])).rowCount;
    }

    async list() {
        return (await this.#database.query(`
            SELECT id, created_at, username, callback_uri_token FROM "user"
        `)).rows;
    }
}
