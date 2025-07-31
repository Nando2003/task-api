import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const isTest = process.env.NODE_ENV === 'test'

const dbConfig = defineConfig({
  connection: isTest ? 'sqlite' : env.get('DB_CONNECTION', 'mysql'),
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },

    sqlite: {
      client: 'sqlite',
      connection: {
        filename: ':memory:',
      },
      pool: { min: 1, max: 1 },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },

  },
})

export default dbConfig