import fastify from "fastify";
import { knex } from "./database";


export const app = fastify()

app.get('/test', async ()=> {
    const test = await knex('sqlite_schema').select('*')
    return test
})
