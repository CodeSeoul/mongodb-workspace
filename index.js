#!/usr/bin/env node

require('dotenv').config();

const { MongoClient } = require('mongodb');

const connectionString = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`;
// Normally, don't do this
console.debug(`'Connection string: ${connectionString}'`);

console.log('Connecting to database');
const client = new MongoClient(connectionString);

async function run() {
    try {
      const database = client.db(process.env.MONGODB_DATABASE);
      const departments = database.collection('departments');
      // Query for a movie that has the title 'Back to the Future'
      const query = {};
      console.log('Running find...');
      const departmentDocsCursor = await departments.find(query);
      console.log('Printing results...');
      for await (const doc of departmentDocsCursor) {
        console.log(doc);
      }
      console.log('Done.');
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
}
run().catch(console.dir);
