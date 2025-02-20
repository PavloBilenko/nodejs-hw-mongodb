import mongoose from 'mongoose';

async function initMongoConnection() {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    await mongoose.connect(mongoUrl);

    console.log('✅ Mongo connection successfully established!');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

export default initMongoConnection;
