import mongoose from 'mongoose';

async function initMongoConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD,
      dbName: process.env.MONGODB_DB,
    });
    console.log('✅ Mongo connection successfully established!');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

export default initMongoConnection;
