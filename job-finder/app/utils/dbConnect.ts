import mongoose from 'mongoose'

// Define type for mongoose cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global namespace
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.DATABASE_URL!

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable')
}

// Initialize cached with a default value to avoid 'possibly undefined' errors
let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!cached.conn && !cached.promise) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then(m => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect
