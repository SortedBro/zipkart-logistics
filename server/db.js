const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zipkart_logistics';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected:', uri);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Make sure MongoDB is running locally, or set MONGODB_URI to an Atlas connection string in server/.env');
  }
}

module.exports = connectDB;
