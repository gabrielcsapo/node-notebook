#!/usr/bin/env node

const program = require('commander');

program
  .version(require('../package.json').version)
  .option('-d, --db [db]', 'Set the db connection', 'mongodb://localhost/node-notebook')
  .parse(process.argv);

process.env.MONGO_URL = process.env.MONGO_URL || program.db;

require('../index');
