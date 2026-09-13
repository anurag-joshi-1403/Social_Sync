const mongoose = require('mongoose');

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI is not set. Skipping DB connection.');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;