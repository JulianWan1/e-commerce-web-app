import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('anon_shopping_cart', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.jsonb('products_list').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('expires_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.raw('DROP TABLE IF EXISTS anon_shopping_cart CASCADE');
}
