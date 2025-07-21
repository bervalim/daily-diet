import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('Users', (table) => {
        table.uuid('id').primary(),
        table.string('name', 255).notNullable(),
        table.string('email',255).notNullable()
        table.uuid('sessionId')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').nullable();
        table.timestamp('deleted_at').nullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users')
}


