import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('Meals',(table)=> {
        table.boolean('isOnDiet')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('Meals',(table)=> {
        table.dropColumn('isOnDiet')
    })
}

