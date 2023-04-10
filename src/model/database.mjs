import pg from 'pg';

export class Database {
    #dbUrl;
    #pool;

    constructor({ dbUrl }) {
        this.#dbUrl = dbUrl;
        this.#pool = null;
    }

    async query(query, params) {
        return await this.#lazyConnect().query(query, params);
    }

    #lazyConnect() {
        if (null === this.#pool) {
            this.#pool = new pg.Pool({
                connectionString: this.#dbUrl,
            });
        }

        return this.#pool;
    }
}
