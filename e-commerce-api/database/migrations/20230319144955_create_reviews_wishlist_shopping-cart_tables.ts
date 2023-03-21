import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('reviews', (table) => {
      table.increments('id');
      table.integer('user_id').references('id').inTable('users').notNullable();
      table
        .integer('product_id')
        .references('id')
        .inTable('products')
        .notNullable();
      table.string('review').notNullable();
      table.integer('stars').notNullable();
      table.timestamps(false, true);
    })
    .createTable('wishlist_entries', (table) => {
      table.increments('id');
      table.integer('user_id').references('id').inTable('users').notNullable();
      table
        .integer('product_id')
        .references('id')
        .inTable('products')
        .notNullable();
      table.timestamp('created_at').notNullable();
    })
    .createTable('shopping_cart_entries', (table) => {
      table.increments('id');
      table.integer('user_id').references('id').inTable('users').notNullable();
      table
        .integer('product_id')
        .references('id')
        .inTable('products')
        .notNullable();
      table.integer('quantity').notNullable();
      table.decimal('total_price', 11, 2).notNullable();
      table.timestamps(false, true);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.raw(
    'DROP TABLE IF EXISTS reviews, wishlist_entries, shopping_cart_entries CASCADE',
  );
}
