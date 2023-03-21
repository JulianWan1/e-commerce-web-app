import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('products', (table) => {
    table.increments('id');
    table.string('name').notNullable().unique();
    table.decimal('price', 11, 2).notNullable();
    table.string('description');
    table.integer('quantity').notNullable();
    table.string('image');
    table.string('extra_info');
    table.timestamps(false, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw('DROP TABLE IF EXISTS products CASCADE');
}
