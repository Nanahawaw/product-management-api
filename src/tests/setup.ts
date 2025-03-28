import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close(); // Close connection
  await mongoose.connect(mongo.getUri()); // Reconnect
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
  await mongo.stop();
});
