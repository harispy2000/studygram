import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (cached.err) throw cached.err;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 12000,
    }).then((conn) => {
      cached.conn = conn;
      return conn;
    }).catch((err) => {
      cached.err = err;
      cached.promise = null;
      throw err;
    });
  }
  return cached.promise;
}

export default connectDB;