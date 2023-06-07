// Responsible for app connection to DB through Knex
// Sets up objection.js to receive Knex instance to ensure objection knows which DB it is being pointed to

import knex from 'knex';
import { Model } from 'objection';
const knexfile = require('./knexfile');

export function setupDb() {
  const db = knex(knexfile.development); // initializing knex instance
  Model.knex(db); // give knex instance to objection
}

// module.exports = setupDb;
