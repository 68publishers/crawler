export default {
  client: 'pg',
  connection: process.env.DB_URL,
  migrations: {
    directory: './src/model/migrations',
    tableName: 'migrations',
    extension: 'mjs',
    loadExtensions: [
      '.mjs',
    ],
  }
}
