import { v4 as uuid } from 'uuid';
import { hashPassword } from '../../helper/password.mjs';
import { randomBytes } from 'node:crypto';

export class UserRepository {
    #databaseClient;

    constructor({ databaseClient }) {
        this.#databaseClient = databaseClient;
    }

    async create(username, password) {
        const id = uuid();
        const hashedPassword = hashPassword(password);
        const callbackUriToken = randomBytes(24).toString('hex');

        await this.#databaseClient('user')
            .insert({
                id: id,
                username: username,
                password: hashedPassword,
                callback_uri_token: callbackUriToken,
            });

        return id;
    }

    async getById(id) {
        const result = await this.#databaseClient('user')
            .select(
                'id',
                'created_at AS createdAt',
                'username',
                'password',
                'callback_uri_token AS callbackUriToken',
            )
            .where('id', id)
            .limit(1);

        return 0 >= result.length ? null : result[0];
    }

    async getByUsername(username) {
        const result = await this.#databaseClient('user')
            .select(
                'id',
                'created_at AS createdAt',
                'username',
                'password',
                'callback_uri_token AS callbackUriToken',
            )
            .where('username', username)
            .limit(1);

        return 0 >= result.length ? null : result[0];
    }

    async delete(id, transaction = undefined) {
        let qb = this.#databaseClient('user')
            .where('id', id)
            .delete();

        if (transaction) {
            qb = qb.transacting(transaction);
        }

        return 0 < (await qb);
    }

    async list() {
        return (await this.#databaseClient('user')
            .select(
                'id',
                'created_at AS createdAt',
                'username',
                'callback_uri_token AS callbackUriToken',
            )
            .orderBy('created_at', 'DESC')
        );
    }
}
