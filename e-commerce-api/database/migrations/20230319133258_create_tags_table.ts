import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('tags', (table) => {
      table.increments('id');
      table.string('tag_name').notNullable().unique();
      table.timestamps(false, true);
    })
    .createTable('products_tags', (table) => {
      table.increments('id');
      table
        .integer('product_id')
        .references('id')
        .inTable('products')
        .notNullable();
      table.integer('tag_id').references('id').inTable('tags').notNullable();
      table.timestamp('created_at').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.raw('DROP TABLE IF EXISTS tags, products_tags CASCADE');
}
