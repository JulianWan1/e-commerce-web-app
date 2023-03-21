import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('payment_methods', (table) => {
    table.increments('id');
    table.string('method').notNullable().unique();
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.raw('DROP TABLE IF EXISTS payment_methods CASCADE');
}
