import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('Meals', (table) => {
        table.uuid('id').primary(),
        table.string('name', 255).notNullable(),
        table.text('description')
        table.date('date').notNullable()
        table.time('hour').notNullable()
        table
          .integer("userId")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("users");
          table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp("updated_at").nullable();
        table.timestamp("deleted_at").nullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}

