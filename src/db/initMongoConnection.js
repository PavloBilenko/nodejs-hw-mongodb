import mongoose from 'mongoose';

async function initMongoConnection() {
  try {
    const mongoURI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.eop3g.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority`;

    await mongoose.connect(mongoURI);

    console.log('✅ Mongo connection successfully established!');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

export default initMongoConnection;
