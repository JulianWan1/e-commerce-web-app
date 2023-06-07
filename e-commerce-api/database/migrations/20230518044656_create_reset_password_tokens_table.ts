import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('reset_password_tokens', (table) => {
    table.increments('id');
    table.string('reset_password_token').notNullable();
		table.integer('user_id').references('id').inTable('users').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('expires_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.raw('DROP TABLE IF EXISTS reset_password_tokens CASCADE');
}
