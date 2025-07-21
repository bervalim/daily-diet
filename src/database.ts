import { knex as setupKnex } from "knex"
import 'dotenv/config'
import { env } from "./env"


console.log('process.env',env)

export const config = {
    client: 'sqlite',
    connection: {
        filename: env.DATABASE_URL
    },
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './db/migrations'
    }
}

export const knex = setupKnex(config)