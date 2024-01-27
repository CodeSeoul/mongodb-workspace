#!/usr/bin/env node

require('dotenv').config();

const { MongoClient, ObjectId } = require('mongodb');

const connectionString = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`;
// Normally, don't do this
console.debug(`'Connection string: ${connectionString}'`);

console.log('Connecting to database');
const client = new MongoClient(connectionString);

async function run() {
    try {
      const database = client.db(process.env.MONGODB_DATABASE);
      const departments = database.collection('departments');
      departments.createIndex({
        name: 1
      }, {
        unique: true
      });
      // Query for a movie that has the title 'Back to the Future'
      const query = {};
      console.log('Running find...');
      const departmentDocsCursor = await departments.find(query);
      console.log('Printing results...');
      for await (const doc of departmentDocsCursor) {
        console.log(doc);
      }
      const insertDepartmentResult = await departments.insertOne({
        name: 'marketing',
      });
      const marketingId = insertDepartmentResult.insertedId;
      console.log(`marketing id: ${marketingId}`);
      console.log('Creating employees collection...');
      const employees = await database.collection('employees');
      console.log('Creating employees indexes...');
      await employees.createIndex({
        name: 1
      });
      await employees.createIndex({
        'department.name': 1
      });
      const bobEmployee = {
        _id: new ObjectId(),
        name: 'Bob Smith',
        department: {
            _id: marketingId,
            name: 'marketing'
        }
      };
      console.log('New employee:');
      console.log(bobEmployee);
      console.log('Inserting employee...');
      await employees.insertOne(bobEmployee);
      await departments.updateMany({}, {
        $set: {
            'members': []
        }
      });
      console.log('Creating index on departments...');
      departments.createIndex({
        'members.name': 1
      });
      console.log('Updating marketing department with bob');
      departments.updateOne({
        _id: bobEmployee.department._id,
      }, {
        $set: {
            members: [{
                _id: bobEmployee._id,
                name: bobEmployee.name,
            }]
        }
      });
      console.log('Done.');
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
}
run().catch(console.dir);
