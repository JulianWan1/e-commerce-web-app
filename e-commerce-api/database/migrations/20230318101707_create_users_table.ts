import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('full_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('hashed_password').notNullable().unique();
    table.string('salt').notNullable().unique();
    table.string('phone_number').notNullable().unique();
    table.string('role').notNullable();
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw('DROP TABLE IF EXISTS users CASCADE');
}
