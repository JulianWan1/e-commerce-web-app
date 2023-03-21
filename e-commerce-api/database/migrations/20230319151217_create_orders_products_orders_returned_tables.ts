import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('orders', (table) => {
      table.increments('id');
      table.integer('user_id').references('id').inTable('users').notNullable();
      table
        .integer('payment_method_id')
        .references('id')
        .inTable('payment_methods')
        .notNullable();
      table.decimal('total_price', 11, 2).notNullable();
      table.string('shipping_address').notNullable();
      table.string('phone_number').notNullable();
      table.timestamps(false, true);
    })
    .createTable('products_orders', (table) => {
      table.increments('id');
      table
        .integer('order_id')
        .references('id')
        .inTable('orders')
        .notNullable();
      table
        .integer('product_id')
        .references('id')
        .inTable('products')
        .notNullable();
      table.integer('quantity').notNullable();
      table.decimal('total_price', 11, 2).notNullable();
      table.timestamps(false, true);
    })
    .createTable('returned', (table) => {
      table.increments('id');
      table.integer('user_id').references('id').inTable('users').notNullable();
      table
        .integer('order_id')
        .references('id')
        .inTable('orders')
        .notNullable();
      table
        .integer('product_id')
        .references('id')
        .inTable('products')
        .notNullable();
      table.integer('quantity').notNullable();
      table.decimal('total_price', 11, 2).notNullable();
      table.timestamp('created_at').notNullable();
      table.boolean('refunded').notNullable();
      table.timestamp('refunded_at').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.raw(
    'DROP TABLE IF EXISTS orders, products_orders, returned CASCADE',
  );
}
