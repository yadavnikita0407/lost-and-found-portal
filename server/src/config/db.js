const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();

  // Strip accidental quotes if user wrapped the env var in quotes
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  // Auto-prepend mongodb+srv:// if user accidentally copied starting from username or cluster
  if (uri && !uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    if (uri.includes('.mongodb.net')) {
      uri = `mongodb+srv://${uri}`;
    }
  }

  const isPlaceholder =
    !uri ||
    uri.includes('<user>') ||
    uri.includes('<username>') ||
    uri.includes('<password>') ||
    uri.includes('cluster.mongodb.net/lostfound');

  if (isPlaceholder) {
    console.warn('\n============================================================');
    console.warn('[Notice] Placeholder or unconfigured MONGO_URI.');
    console.warn('Running with in-memory store.');
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
    console.warn('[Notice] Falling back to in-memory store so the service remains operational.');
  }
};

module.exports = connectDB;
