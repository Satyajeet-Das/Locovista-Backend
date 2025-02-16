import mongoose from 'mongoose';
import { config } from '../configs';
import { logger } from '../services';

// Database URL
const { DB_USER, DB_PASS,  DB_CONNECTION, NODE_ENV } = config.env;
const dbURL = DB_CONNECTION;;

// Import the mongoose module
const options: mongoose.ConnectOptions = {
  autoIndex: false
}

// Secure MongoDB with username and password
if (DB_USER && DB_PASS) {
  options.user = DB_USER;
  options.pass = DB_PASS;
}

async function connectDB(): Promise<mongoose.Connection> {
  try {
    // Mongoose Debug Mode [set it as `false` in production]
    mongoose.set('debug', NODE_ENV === 'development');
    mongoose.set('strictQuery', false);

    await mongoose.connect(dbURL, options);
    logger.info('<<<< Connected to MongoDB >>>>');

    mongoose.Promise = global.Promise // Get Mongoose to use the global promise library
    const db: mongoose.Connection = mongoose.connection ;// Get the default connection
    return db;
  } catch (error) {
    logger.error('MongoDB Connection Error: ', error);
    process.exit(1);
  }
}

export default connectDB;
