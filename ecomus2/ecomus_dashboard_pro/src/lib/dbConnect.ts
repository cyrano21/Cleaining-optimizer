import connectDB from './mongodb';

// Alias for backward compatibility
const dbConnect = connectDB;

export default dbConnect;
export { dbConnect, connectDB };
