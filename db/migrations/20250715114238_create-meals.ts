import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary,
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
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}

