const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const isPlaceholder =
    !uri ||
    uri.includes('<user>') ||
    uri.includes('<password>') ||
    uri.includes('cluster.mongodb.net/lostfound');

  if (isPlaceholder) {
    console.warn('\n============================================================');
    console.warn('[Notice] Placeholder MONGO_URI in server/.env');
    console.warn('Running with in-memory development store.');
    console.warn('Login and Registration endpoints are active & ready to use!');
    console.warn('Default demo credentials:');
    console.warn('  Student: student@college.edu / Password123');
    console.warn('  Admin:   admin@college.edu / Password123');
    console.warn('============================================================\n');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.warn('\n[Notice] Falling back to in-memory development store.\n');
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
